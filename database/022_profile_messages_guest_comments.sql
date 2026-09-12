-- Reviewed locally only. Back up and apply before publishing the matching application.
begin;
set local lock_timeout='5s';
set local statement_timeout='60s';

-- Public aggregates never include drafts, private reviews, or unmoderated comments.
create function public.cw_public_activity() returns table(slug text,comments bigint,recent_comments bigint,saved bigint)
language sql stable security definer set search_path=public as $$
 select p.slug,count(c.created_at),count(c.created_at) filter(where c.created_at>=now()-interval '30 days'),
 (select count(*) from saved_projects s where s.project_slug=p.slug)
 from projects p left join lateral(
 select created_at from project_experiences where project_slug=p.slug and moderation_status='published'
 union all select created_at from creator_feedback where project_slug=p.slug and visibility='public' and moderation_status='published'
 ) c on true where p.listing_status='published' group by p.slug;
$$;

alter table project_experiences alter column author_user_id drop not null;
alter table project_experiences add column guest_hash text,
 add column guest_expires_at timestamptz,
 add column guest_subscriber uuid references users(id) on delete cascade,
 add constraint experience_identity check(author_user_id is not null or guest_expires_at is not null),
 add constraint guest_hash_format check(guest_hash is null or guest_hash ~ '^[a-f0-9]{64}$');
create unique index experience_guest_project on project_experiences(project_slug,guest_hash) where guest_hash is not null;
create function public.cw_submit_guest_comment(p_id uuid,p_slug text,p_hash text,p_message text) returns uuid
language plpgsql security definer set search_path=public as $$
declare existing project_experiences%rowtype;
begin
 if p_id is null or p_hash is null or p_hash !~ '^[a-f0-9]{64}$' or p_message is null or length(p_message)>800 or cw_wish_words(p_message) not between 7 and 150 then raise exception 'Invalid comment';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_hash,0));
 perform 1 from projects where slug=p_slug and listing_status='published' for share;
 if not found then raise exception 'Project unavailable';end if;
 select * into existing from project_experiences where id=p_id or (project_slug=p_slug and guest_hash=p_hash) limit 1;
 if found then
  if existing.guest_hash=p_hash and existing.project_slug=p_slug then
   if existing.id=p_id and existing.response<>trim(p_message) then raise exception 'Request conflict';end if;
   return existing.id;
  end if;
  raise exception 'Request conflict';
 end if;
 if (select count(*) from project_experiences where guest_hash=p_hash)>=5 then raise exception 'Guest limit reached';end if;
 insert into project_experiences(id,project_slug,response,guest_hash,guest_expires_at) values(p_id,p_slug,trim(p_message),p_hash,now()+interval '7 days');
 return p_id;
end $$;
create function public.cw_claim_guest_comments(p_user uuid,p_hash text) returns integer
language plpgsql security definer set search_path=public as $$
declare claimed integer;
begin
 perform 1 from users where id=p_user and account_status='active' for update;
 if not found or p_hash is null or p_hash !~ '^[a-f0-9]{64}$' then raise exception 'Not allowed';end if;
 update project_experiences set guest_subscriber=p_user where guest_hash=p_hash and guest_subscriber is null and guest_expires_at>now();
 get diagnostics claimed=row_count;return claimed;
end $$;
create function public.cw_comment_publication_notice() returns trigger language plpgsql security definer set search_path=public as $$
declare subscriber uuid;
begin
 subscriber=coalesce(new.guest_subscriber,new.author_user_id);
 if subscriber is not null and new.moderation_status='published' and
 (old.moderation_status<>'published' or old.guest_subscriber is distinct from new.guest_subscriber) then
  insert into notifications(id,user_id,kind,title,href) values(new.id,subscriber,'comment','Your comment has been published.','/?project='||new.project_slug) on conflict(id) do nothing;
 end if;return new;
end $$;
create trigger comment_publication_notice after update of moderation_status,guest_subscriber on project_experiences for each row execute function cw_comment_publication_notice();

create table direct_threads(id uuid primary key default gen_random_uuid(),member_a uuid not null references users(id),member_b uuid not null references users(id),created_at timestamptz not null default now(),unique(member_a,member_b),check(member_a<member_b));
create table direct_messages(id uuid primary key,thread_id uuid not null references direct_threads(id),sender_id uuid not null references users(id),message text not null check(length(trim(message)) between 1 and 2000),created_at timestamptz not null default now());
create index direct_message_time on direct_messages(thread_id,created_at desc,id);
create table direct_reads(thread_id uuid not null references direct_threads(id),user_id uuid not null references users(id),read_at timestamptz not null,primary key(thread_id,user_id));
create table direct_blocks(blocker uuid not null references users(id),blocked uuid not null references users(id),created_at timestamptz not null default now(),primary key(blocker,blocked),check(blocker<>blocked));
create function public.cw_send_direct_message(p_actor uuid,p_recipient uuid,p_request uuid,p_message text) returns uuid
language plpgsql security definer set search_path=public as $$
declare thread uuid; prior direct_messages%rowtype;
begin
 if p_actor is null or p_recipient is null or p_actor=p_recipient or p_request is null or p_message is null or length(trim(p_message)) not between 1 and 2000 then raise exception 'Invalid message';end if;
 -- Same lock for sending/blocking. No message may slip past a completed block.
 perform pg_advisory_xact_lock(hashtextextended(least(p_actor,p_recipient)::text||greatest(p_actor,p_recipient)::text,0));
 perform 1 from users where id in (p_actor,p_recipient) and account_status='active' order by id for share;
 if (select count(*) from users where id in(p_actor,p_recipient) and account_status='active')<>2 then raise exception 'Account unavailable';end if;
 select id into thread from direct_threads where member_a=least(p_actor,p_recipient) and member_b=greatest(p_actor,p_recipient);
 if thread is null and not exists(select 1 from profiles where user_id=p_recipient and is_public) and not exists(select 1 from projects where owner_user_id=p_recipient and is_studio and listing_status='published') then raise exception 'Profile unavailable';end if;
 if exists(select 1 from direct_blocks where (blocker=p_actor and blocked=p_recipient) or(blocker=p_recipient and blocked=p_actor)) then raise exception 'Messages unavailable for this conversation';end if;
 select * into prior from direct_messages where id=p_request;
 if found then
  if prior.sender_id=p_actor and prior.thread_id=thread and prior.message=trim(p_message) then return thread;end if;
  raise exception 'Request conflict';
 end if;
 if exists(select 1 from direct_messages where sender_id=p_actor and created_at>now()-interval '5 seconds') then raise exception 'Please wait before sending again';end if;
 if thread is null then insert into direct_threads(member_a,member_b) values(least(p_actor,p_recipient),greatest(p_actor,p_recipient)) returning id into thread;end if;
 insert into direct_messages(id,thread_id,sender_id,message) values(p_request,thread,p_actor,trim(p_message));
 insert into notifications(id,user_id,kind,title,href) select p_request,p_recipient,'message','You have a new private message.','/dashboard/messages?direct='||thread where coalesce((select feedback_alerts from account_preferences where user_id=p_recipient),true);
 return thread;
end $$;
create function public.cw_direct_block(p_actor uuid,p_other uuid,p_block boolean) returns void
language plpgsql security definer set search_path=public as $$
begin
 if p_actor is null or p_other is null or p_actor=p_other or not exists(select 1 from users where id=p_actor and account_status='active') then raise exception 'Not allowed';end if;
 perform pg_advisory_xact_lock(hashtextextended(least(p_actor,p_other)::text||greatest(p_actor,p_other)::text,0));
 if p_block then insert into direct_blocks(blocker,blocked) values(p_actor,p_other) on conflict do nothing;
 else delete from direct_blocks where blocker=p_actor and blocked=p_other;end if;
end $$;
create function public.cw_mark_direct_read(p_user uuid,p_thread uuid,p_seen timestamptz) returns void
language plpgsql security definer set search_path=public as $$
begin
 if p_seen is null or p_seen>now()+interval '1 second' or not exists(select 1 from users where id=p_user and account_status='active') or not exists(select 1 from direct_threads where id=p_thread and p_user in(member_a,member_b)) then raise exception 'Not allowed';end if;
 insert into direct_reads(thread_id,user_id,read_at) values(p_thread,p_user,p_seen) on conflict(thread_id,user_id) do update set read_at=greatest(direct_reads.read_at,excluded.read_at);
end $$;
revoke all on function cw_mark_direct_read(uuid,uuid,timestamptz) from public,anon,authenticated;
grant execute on function cw_mark_direct_read(uuid,uuid,timestamptz) to service_role;
-- Include both conversation types, with filtering/sorting/pagination applied once over the union.
create function public.cw_combined_inbox(p_user uuid,p_project text default '',p_unread boolean default false,p_page integer default 0,p_sort text default 'newest',p_kind text default 'all')
returns table(id uuid,kind text,title text,counterpart text,last_message text,last_at timestamptz,unread boolean,total_count bigint)
language sql stable security definer set search_path=public as $$
 with threads as (
 select f.id,'project'::text kind,p.title,coalesce(pr.display_name,'Member') counterpart,
 coalesce(l.message,f.message) last_message,coalesce(l.created_at,f.created_at) last_at,
 coalesce(i.last_at>coalesce(rd.read_at,'-infinity'::timestamptz),false) unread
 from creator_feedback f join projects p on p.slug=f.project_slug
 left join profiles pr on pr.user_id=case when f.author_user_id=p_user then p.owner_user_id else f.author_user_id end
 left join feedback_reads rd on rd.feedback_id=f.id and rd.user_id=p_user
 left join lateral(select r.message,r.created_at from feedback_replies r where r.feedback_id=f.id order by r.created_at desc,r.id desc limit 1) l on true
 left join lateral(select max(q.created_at) last_at from(select f.created_at where f.author_user_id<>p_user union all select r.created_at from feedback_replies r where r.feedback_id=f.id and r.author_user_id<>p_user) q) i on true
 where f.author_user_id=p_user or p.owner_user_id=p_user
 union all
 select t.id,'direct',coalesce(pr.display_name,'Member'),coalesce(pr.display_name,'Member'),l.message,l.created_at,
 exists(select 1 from direct_messages m where m.thread_id=t.id and m.sender_id<>p_user and m.created_at>coalesce(rd.read_at,'-infinity'::timestamptz))
 from direct_threads t join lateral(select message,created_at from direct_messages where thread_id=t.id order by created_at desc,id desc limit 1) l on true
 left join profiles pr on pr.user_id=case when t.member_a=p_user then t.member_b else t.member_a end
 left join direct_reads rd on rd.thread_id=t.id and rd.user_id=p_user where p_user in(t.member_a,t.member_b)
 ) select t.*,count(*) over() from threads t where exists(select 1 from users where id=p_user and account_status='active') and (p_kind='all' or t.kind=p_kind) and (p_project='' or strpos(lower(t.title||' '||t.counterpart),lower(p_project))>0) and (not p_unread or t.unread)
 order by case when p_sort='oldest' then t.last_at end asc,case when p_sort='project' then lower(t.title) end asc,case when p_sort<>'oldest' then t.last_at end desc,t.id limit 25 offset least(greatest(p_page,0),10000)*25;
$$;
-- Both account-erasure flows change account_status. Keep new content in that same transaction.
create function public.cw_erase_new_conversations() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if new.account_status='deleted' and old.account_status<>'deleted' then
  update direct_messages set message='[Removed by account deletion]' where sender_id=new.id;
  update project_experiences set response='[Removed by account deletion]',moderation_status='hidden',guest_hash=null,guest_subscriber=null where guest_subscriber=new.id;
  delete from direct_reads where user_id=new.id;delete from direct_blocks where blocker=new.id or blocked=new.id;
 end if;return new;
end $$;
create trigger erase_new_conversations after update of account_status on users for each row execute function cw_erase_new_conversations();
alter table direct_threads enable row level security;alter table direct_messages enable row level security;alter table direct_reads enable row level security;alter table direct_blocks enable row level security;
revoke all on direct_threads,direct_messages,direct_reads,direct_blocks from public,anon,authenticated;
grant select on direct_threads,direct_messages,direct_blocks to service_role;
grant select,insert,update on direct_reads to service_role;
revoke all on function cw_public_activity(),cw_submit_guest_comment(uuid,text,text,text),cw_claim_guest_comments(uuid,text),cw_comment_publication_notice(),cw_send_direct_message(uuid,uuid,uuid,text),cw_direct_block(uuid,uuid,boolean),cw_combined_inbox(uuid,text,boolean,integer,text,text),cw_erase_new_conversations() from public,anon,authenticated;
grant execute on function cw_public_activity(),cw_submit_guest_comment(uuid,text,text,text),cw_claim_guest_comments(uuid,text),cw_send_direct_message(uuid,uuid,uuid,text),cw_direct_block(uuid,uuid,boolean),cw_combined_inbox(uuid,text,boolean,integer,text,text) to service_role;
commit;
