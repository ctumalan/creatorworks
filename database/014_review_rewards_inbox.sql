-- Additive review rewards and unified inbox. Apply after 013; existing content/access preserved.
begin;
alter table public.creator_feedback drop constraint creator_feedback_helpful_check;
alter table public.creator_feedback add constraint creator_feedback_helpful_check check(helpful in ('yes','somewhat','not_yet','not_tried','unclear'));
alter table public.creator_feedback add column attempt text check(attempt in ('completed','stuck','blocked','not_tried'));
alter table public.creator_feedback add column focus text check(focus in ('ease','bugs','results','explanation','development'));
alter table public.feedback_qualifications add column creator_user_id uuid references public.users(id);
update public.feedback_qualifications q set creator_user_id=p.owner_user_id from public.projects p where p.slug=q.project_slug;
alter table public.credit_ledger drop constraint credit_ledger_amount_check;
alter table public.credit_ledger add constraint credit_ledger_amount_check check(amount between -10 and 10);
create table public.feedback_ratings(
 feedback_id uuid primary key references public.creator_feedback(id),
 creator_user_id uuid not null references public.users(id), reviewer_user_id uuid not null references public.users(id),
 total integer not null check(total in (1,5,10)), reason text not null check(length(reason)<=300),
 revision integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.feedback_reads(
 user_id uuid not null references public.users(id), feedback_id uuid not null references public.creator_feedback(id),
 read_at timestamptz not null default now(), primary key(user_id,feedback_id)
);
do $$ declare t text; begin
 foreach t in array array['feedback_ratings','feedback_reads'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon,authenticated',t);
 execute format('grant select,insert,update,delete on public.%I to service_role',t);
 end loop;
end $$;
create or replace function public.cw_apply_qualification(p_feedback uuid) returns void language plpgsql set search_path=public as $$
declare q feedback_qualifications%rowtype; f creator_feedback%rowtype; req feedback_requests%rowtype; n integer; begin
 perform pg_advisory_xact_lock(7112026);
 select * into q from feedback_qualifications where feedback_id=p_feedback for update;
 select * into f from creator_feedback where id=p_feedback;
 if q.status='qualified' then
  insert into credit_ledger(user_id,event_key,amount,reason,feedback_id) values(q.user_id,'earn:'||p_feedback||':'||q.revision,1,'Qualifying feedback',p_feedback) on conflict do nothing;
  if not found then return;end if;
  select count(distinct creator_user_id)::integer/5 into n from feedback_qualifications where user_id=q.user_id and status='qualified';
  insert into project_slot_grants(user_id,milestone,reason) select q.user_id,x,'Five different creators helped' from generate_series(1,n) x on conflict do nothing;
  select r.* into req from feedback_requests r join projects p on p.slug=r.project_slug where r.project_slug=q.project_slug and r.status='queued' and r.user_id<>q.user_id and p.owner_user_id=r.user_id and p.listing_status='published' and r.created_at<=f.created_at order by r.created_at,r.id limit 1 for update of r;
  if found and not exists(select 1 from feedback_requests where fulfilled_feedback_id=p_feedback) then
   update feedback_requests set status='fulfilled',fulfilled_feedback_id=p_feedback,updated_at=now() where id=req.id;
   insert into credit_ledger(user_id,event_key,amount,reason,feedback_id,request_id) values(req.user_id,'fulfilled:'||req.id,0,'Feedback request fulfilled',p_feedback,req.id);
   insert into notifications(user_id,kind,title,href) values(req.user_id,'credits','Your feedback request received a response','/dashboard/thread/'||p_feedback);
  end if;
  insert into notifications(user_id,kind,title,href) values(q.user_id,'credits','You earned a feedback credit. Thank you for helping another creator.','/dashboard/community');
 end if;
end $$;
create or replace function public.cw_qualify_feedback() returns trigger language plpgsql set search_path=public as $$
declare decision text:='qualified'; why text:='Original feedback meeting community rules'; tokens text[]; other_tokens text[]; total integer; common integer; old_msg record; begin
 perform pg_advisory_xact_lock(7112026);
 if not exists(select 1 from projects where slug=new.project_slug and listing_status='published' and owner_user_id is not null and owner_user_id<>new.author_user_id) then raise exception 'Feedback must be for another creator’s published project'; end if;
 if new.attempt='not_tried' or new.attempt is null then decision='pending';why='Describe a firsthand attempt before earning credit'; end if;
 select array_agg(distinct lower(w)) into tokens from regexp_split_to_table(new.message,'[^[:alnum:]]+') w where w<>'';
 if cardinality(tokens)<5 then decision='pending';why='Repetitive wording needs review'; end if;
 for old_msg in select message from creator_feedback where author_user_id=new.author_user_id and id<>new.id order by created_at desc limit 200 loop
  select array_agg(distinct lower(w)) into other_tokens from regexp_split_to_table(old_msg.message,'[^[:alnum:]]+') w where w<>'';
  select count(*) into common from unnest(tokens) w where w=any(other_tokens);
  total=cardinality(tokens)+coalesce(cardinality(other_tokens),0)-common;
  if total>0 and common::numeric/total>=0.8 then decision='pending';why='Similar feedback already submitted; review required';exit;end if;
 end loop;
 insert into feedback_qualifications(feedback_id,user_id,project_slug,word_count,status,reason,creator_user_id) values(new.id,new.author_user_id,new.project_slug,cw_comment_words(new.message),decision,why,(select owner_user_id from projects where slug=new.project_slug));
 perform cw_apply_qualification(new.id);return new;
end $$;
create or replace function public.cw_credit_review(p_actor uuid,p_feedback uuid,p_status text,p_reason text,p_revision integer) returns void language plpgsql set search_path=public as $$
declare q feedback_qualifications%rowtype; req feedback_requests%rowtype; reward integer; begin
 perform pg_advisory_xact_lock(7112026);
 if p_status not in ('qualified','rejected','revoked') or length(trim(p_reason)) not between 3 and 300 then raise exception 'Explain the decision'; end if;
 select * into q from feedback_qualifications where feedback_id=p_feedback for update;
 if not found or q.revision<>p_revision then raise exception 'Reload this review'; end if;
 if q.status=p_status then return;end if;
 if p_status='qualified' and exists(select 1 from creator_feedback where id=p_feedback and moderation_status='hidden') then raise exception 'Restore the feedback before awarding credit';end if;
 update feedback_qualifications set status=p_status,reason=trim(p_reason),reviewed_by=p_actor,revision=revision+1,updated_at=now() where feedback_id=p_feedback;
 if q.status='qualified' then
  select coalesce(sum(amount),0) into reward from credit_ledger where feedback_id=p_feedback and user_id=q.user_id;
  insert into credit_ledger(user_id,event_key,amount,reason,feedback_id) values(q.user_id,'reverse:'||p_feedback||':'||(q.revision+1),-reward,trim(p_reason),p_feedback);
  select * into req from feedback_requests where fulfilled_feedback_id=p_feedback and status='fulfilled' for update;
  if found then
   update feedback_requests set status='invalidated',updated_at=now() where id=req.id;
   insert into credit_ledger(user_id,event_key,amount,reason,request_id) values(req.user_id,'refund-invalid:'||req.id,1,'Removed feedback: credit returned',req.id) on conflict do nothing;
  end if;
 end if;
 update feedback_ratings set total=1,reason='Reward reset after moderation',updated_at=now() where feedback_id=p_feedback;
 if p_status='qualified' then perform cw_apply_qualification(p_feedback);end if;
 if p_actor is not null then insert into operations_log(actor_id,action,target_id,reason) values(p_actor,'credit-review.'||q.status||'.'||p_status,p_feedback,p_reason);end if;
 insert into notifications(user_id,kind,title,href) values(q.user_id,'credits','Feedback credit review: '||p_reason,'/dashboard/community');
end $$;
-- The service binds p_actor to the signed-in member, never a submitted user id.
-- A shared transaction lock serializes ratings with qualifications and credit spending.
create function public.cw_rate_feedback(p_actor uuid,p_feedback uuid,p_total integer,p_reason text,p_revision integer)
returns void language plpgsql set search_path=public as $$
declare f creator_feedback%rowtype; q feedback_qualifications%rowtype; r feedback_ratings%rowtype; earned integer; owner_id uuid; revision_now integer;
begin
 perform pg_advisory_xact_lock(7112026);
 if p_total is null or p_total not in (5,10) or p_reason is null or length(trim(p_reason)) not between 10 and 300 then raise exception 'Choose a rating and explain its impact';end if;
 select * into f from creator_feedback where id=p_feedback for update;
 if not found then raise exception 'Conversation not found';end if;
 select owner_user_id into owner_id from projects where slug=f.project_slug for share;
 if p_actor is null or p_actor is distinct from owner_id or p_actor=f.author_user_id or not exists(select 1 from users where id=p_actor and account_status='active') then raise exception 'Not allowed';end if;
 select * into q from feedback_qualifications where feedback_id=p_feedback for update;
 if not found or q.status<>'qualified' or f.moderation_status='hidden' then raise exception 'Only qualifying feedback can receive a bonus';end if;
 select * into r from feedback_ratings where feedback_id=p_feedback for update;
 revision_now=coalesce(r.revision,0);
 if revision_now is distinct from p_revision then raise exception 'Reload this conversation before rating again';end if;
 if r.total=p_total then return;end if;
 if coalesce(r.total,1)>p_total then raise exception 'Recognition can be upgraded, not withdrawn; report abuse for review';end if;
 if coalesce(r.total,1)=1 then
  if exists(select 1 from feedback_ratings where creator_user_id=p_actor and reviewer_user_id=f.author_user_id and feedback_id<>p_feedback and total>1 and created_at>now()-interval '30 days') then raise exception 'One bonus per creator pair every 30 days';end if;
  if (select count(*) from feedback_ratings where reviewer_user_id=f.author_user_id and total>1 and created_at>now()-interval '30 days')>=5 then raise exception 'Monthly bonus limit reached';end if;
 end if;
 insert into feedback_ratings(feedback_id,creator_user_id,reviewer_user_id,total,reason,revision)
 values(p_feedback,p_actor,f.author_user_id,p_total,trim(p_reason),revision_now+1)
 on conflict(feedback_id) do update set total=excluded.total,reason=excluded.reason,revision=excluded.revision,updated_at=now();
 select coalesce(sum(amount),0) into earned from credit_ledger where feedback_id=p_feedback and user_id=f.author_user_id;
 insert into credit_ledger(user_id,event_key,amount,reason,feedback_id) values(f.author_user_id,'recognition:'||p_feedback||':'||(revision_now+1),p_total-earned,trim(p_reason),p_feedback);
 insert into notifications(user_id,kind,title,href) values(f.author_user_id,'credits',case p_total when 5 then 'Your review was useful: 5 total credits earned.' else 'Your review made a difference: 10 total credits earned.' end,'/dashboard/messages?thread='||p_feedback);
 insert into operations_log(actor_id,target_id,action,reason) values(p_actor,p_feedback,'feedback.recognition.'||p_total,trim(p_reason));
end $$;
create function public.cw_message_inbox(p_user uuid,p_project text default '',p_unread boolean default false,p_page integer default 0)
returns table(id uuid,project_slug text,title text,counterpart text,last_message text,last_at timestamptz,unread boolean,total_count bigint)
language sql stable set search_path=public as $$
 with threads as (
 select f.id,f.project_slug,p.title,coalesce(pr.display_name,'Member') counterpart,
 coalesce(last_reply.message,f.message) last_message,coalesce(last_reply.created_at,f.created_at) last_at,
 coalesce(incoming.last_at>coalesce(rd.read_at,'-infinity'::timestamptz),false) unread
 from creator_feedback f join projects p on p.slug=f.project_slug
 left join profiles pr on pr.user_id=case when f.author_user_id=p_user then p.owner_user_id else f.author_user_id end
 left join feedback_reads rd on rd.feedback_id=f.id and rd.user_id=p_user
 left join lateral(select r.message,r.created_at from feedback_replies r where r.feedback_id=f.id order by r.created_at desc,r.id desc limit 1) last_reply on true
 left join lateral(select max(i.created_at) last_at from (
  select f.created_at where f.author_user_id<>p_user
  union all select r.created_at from feedback_replies r where r.feedback_id=f.id and r.author_user_id<>p_user
 ) i) incoming on true
 where (f.author_user_id=p_user or p.owner_user_id=p_user) and (p_project='' or strpos(lower(p.title),lower(p_project))>0)
 and exists(select 1 from users where id=p_user and account_status='active')
 )
 select t.*,count(*) over() from threads t where not p_unread or t.unread order by t.last_at desc,t.id limit 25 offset least(greatest(p_page,0),10000)*25;
$$;
create function public.cw_credit_totals(p_user uuid)
returns table(balance bigint,eligible bigint,slots bigint,used bigint) language sql stable set search_path=public as $$
 select coalesce((select sum(amount) from credit_ledger where user_id=p_user),0),
 (select count(distinct creator_user_id) from feedback_qualifications where user_id=p_user and status='qualified'),
 1+(select count(*) from project_slot_grants where user_id=p_user),
 (select count(*) from project_slot_assignments where user_id=p_user);
$$;
revoke all on function public.cw_credit_totals(uuid) from public,anon,authenticated;
grant execute on function public.cw_credit_totals(uuid) to service_role;
create function public.cw_mark_feedback_read(p_user uuid,p_feedback uuid,p_seen timestamptz) returns void language plpgsql set search_path=public as $$
begin
 if not exists(select 1 from creator_feedback f join projects p on p.slug=f.project_slug where f.id=p_feedback and (f.author_user_id=p_user or p.owner_user_id=p_user)) then raise exception 'Not allowed';end if;
 insert into feedback_reads(user_id,feedback_id,read_at) values(p_user,p_feedback,least(p_seen,now()))
 on conflict(user_id,feedback_id) do update set read_at=greatest(feedback_reads.read_at,excluded.read_at);
end $$;
revoke all on function public.cw_mark_feedback_read(uuid,uuid,timestamptz) from public,anon,authenticated;
grant execute on function public.cw_mark_feedback_read(uuid,uuid,timestamptz) to service_role;
revoke all on function public.cw_rate_feedback(uuid,uuid,integer,text,integer) from public,anon,authenticated;
revoke all on function public.cw_message_inbox(uuid,text,boolean,integer) from public,anon,authenticated;
grant execute on function public.cw_rate_feedback(uuid,uuid,integer,text,integer) to service_role;
grant execute on function public.cw_message_inbox(uuid,text,boolean,integer) to service_role;
commit;
