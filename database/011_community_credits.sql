begin;
create table public.feedback_qualifications (
 feedback_id uuid primary key references public.creator_feedback(id), user_id uuid not null references public.users(id), project_slug text not null references public.projects(slug),
 word_count integer not null, status text not null check(status in ('pending','qualified','rejected','revoked')), reason text not null,
 revision integer not null default 0, reviewed_by uuid references public.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id,project_slug)
);
create table public.feedback_requests (
 id uuid primary key, user_id uuid not null references public.users(id), project_slug text not null references public.projects(slug),
 status text not null check(status in ('queued','fulfilled','cancelled','invalidated')), fulfilled_feedback_id uuid unique references public.creator_feedback(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index one_open_feedback_request on public.feedback_requests(project_slug) where status='queued';
create table public.credit_ledger (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id), event_key text not null unique,
 amount integer not null check(amount between -1 and 1), reason text not null, feedback_id uuid references public.creator_feedback(id), request_id uuid references public.feedback_requests(id), created_at timestamptz not null default now()
);
create index credit_ledger_user on public.credit_ledger(user_id,created_at);
create table public.project_slot_grants (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id), milestone integer not null, reason text not null, created_at timestamptz not null default now(), unique(user_id,milestone)
);
create table public.project_slot_assignments (
 project_id uuid not null references public.projects(id), user_id uuid not null references public.users(id), created_at timestamptz not null default now(), primary key(project_id,user_id)
);
create table public.daily_discussion_comments (
 id uuid primary key, user_id uuid not null references public.users(id), day_key date not null, tip_index integer not null check(tip_index between 0 and 6),
 message text not null check(length(message)<=800), moderation_status text not null default 'pending' check(moderation_status in ('pending','published','hidden')),
 created_at timestamptz not null default now(), unique(user_id,day_key)
);
create index daily_discussion_public on public.daily_discussion_comments(day_key,created_at desc) where moderation_status='published';
-- Preserve every listing already published or awaiting review. Drafts stay unlimited.
insert into public.project_slot_assignments(project_id,user_id) select id,owner_user_id from public.projects where owner_user_id is not null and listing_status in ('published','in_review');
insert into public.project_slot_grants(user_id,milestone,reason)
 select user_id,-n,'Existing project access' from (select user_id,count(*)::integer total from public.project_slot_assignments group by user_id) s cross join lateral generate_series(1,greatest(0,total-1)) n;
do $$ declare t text; begin
 foreach t in array array['feedback_qualifications','feedback_requests','credit_ledger','project_slot_grants','project_slot_assignments','daily_discussion_comments'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon,authenticated',t);
  execute format('grant select,insert,update,delete on public.%I to service_role',t);
 end loop;
end $$;
create function public.cw_comment_words(p_text text) returns integer language sql immutable as $$
 select count(*)::integer from regexp_split_to_table(trim(coalesce(p_text,'')),'\s+') w where w ~ '[[:alnum:]]';
$$;
create function public.cw_comment_guard() returns trigger language plpgsql set search_path=public as $$
declare msg text; begin
 if tg_table_name='project_experiences' then msg=new.response; else msg=new.message; end if;
 if msg='[Removed by account deletion]' then return new;end if;
 if cw_comment_words(msg) not between 7 and 150 or length(msg)>800 then raise exception 'Write 7–150 words, up to 800 characters.'; end if;
 return new;
end $$;
create trigger community_feedback_words before insert on public.creator_feedback for each row execute function public.cw_comment_guard();
create trigger community_reply_words before insert on public.feedback_replies for each row execute function public.cw_comment_guard();
create trigger community_experience_words before insert or update of response on public.project_experiences for each row execute function public.cw_comment_guard();
create trigger community_daily_words before insert or update of message on public.daily_discussion_comments for each row execute function public.cw_comment_guard();
create function public.cw_daily_review(p_actor uuid,p_id uuid,p_previous text,p_status text,p_reason text) returns void language plpgsql set search_path=public as $$
declare item daily_discussion_comments%rowtype;begin
 if p_status not in ('pending','published','hidden') or length(trim(p_reason)) not between 3 and 300 then raise exception 'Explain the decision';end if;
 select * into item from daily_discussion_comments where id=p_id for update;
 if not found or item.moderation_status<>p_previous then raise exception 'Reload this review';end if;
 update daily_discussion_comments set moderation_status=p_status where id=p_id;
 insert into operations_log(actor_id,action,target_id,reason) values(p_actor,'daily-comment.'||p_status,p_id,p_reason);
end $$;
create function public.cw_apply_qualification(p_feedback uuid) returns void language plpgsql set search_path=public as $$
declare q feedback_qualifications%rowtype; f creator_feedback%rowtype; req feedback_requests%rowtype; n integer; begin
 perform pg_advisory_xact_lock(7112026);
 select * into q from feedback_qualifications where feedback_id=p_feedback for update;
 select * into f from creator_feedback where id=p_feedback;
 if q.status='qualified' then
  insert into credit_ledger(user_id,event_key,amount,reason,feedback_id) values(q.user_id,'earn:'||p_feedback||':'||q.revision,1,'Qualifying feedback',p_feedback) on conflict do nothing;
  if not found then return;end if;
  select count(*)::integer/5 into n from feedback_qualifications where user_id=q.user_id and status='qualified';
  insert into project_slot_grants(user_id,milestone,reason) select q.user_id,x,'Five different projects helped' from generate_series(1,n) x on conflict do nothing;
  select r.* into req from feedback_requests r join projects p on p.slug=r.project_slug where r.project_slug=q.project_slug and r.status='queued' and r.user_id<>q.user_id and p.owner_user_id=r.user_id and p.listing_status='published' and r.created_at<=f.created_at order by r.created_at,r.id limit 1 for update of r;
  if found and not exists(select 1 from feedback_requests where fulfilled_feedback_id=p_feedback) then
   update feedback_requests set status='fulfilled',fulfilled_feedback_id=p_feedback,updated_at=now() where id=req.id;
   insert into credit_ledger(user_id,event_key,amount,reason,feedback_id,request_id) values(req.user_id,'fulfilled:'||req.id,0,'Feedback request fulfilled',p_feedback,req.id);
   insert into notifications(user_id,kind,title,href) values(req.user_id,'credits','Your feedback request received a response','/dashboard/thread/'||p_feedback);
  end if;
  insert into notifications(user_id,kind,title,href) values(q.user_id,'credits','You earned a feedback credit. Thank you for helping another creator.','/dashboard/community');
 end if;
end $$;
create function public.cw_qualify_feedback() returns trigger language plpgsql set search_path=public as $$
declare decision text:='qualified'; why text:='Original feedback meeting community rules'; tokens text[]; other_tokens text[]; total integer; common integer; old_msg record; begin
 perform pg_advisory_xact_lock(7112026);
 if not exists(select 1 from projects where slug=new.project_slug and listing_status='published' and owner_user_id is not null and owner_user_id<>new.author_user_id) then raise exception 'Feedback must be for another creator’s published project'; end if;
 if new.helpful='not_tried' then decision='pending';why='Describe a firsthand attempt before earning credit'; end if;
 select array_agg(distinct lower(w)) into tokens from regexp_split_to_table(new.message,'[^[:alnum:]]+') w where w<>'';
 if cardinality(tokens)<5 then decision='pending';why='Repetitive wording needs review'; end if;
 for old_msg in select message from creator_feedback where author_user_id=new.author_user_id and id<>new.id order by created_at desc limit 200 loop
  select array_agg(distinct lower(w)) into other_tokens from regexp_split_to_table(old_msg.message,'[^[:alnum:]]+') w where w<>'';
  select count(*) into common from unnest(tokens) w where w=any(other_tokens);
  total=cardinality(tokens)+coalesce(cardinality(other_tokens),0)-common;
  if total>0 and common::numeric/total>=0.8 then decision='pending';why='Similar feedback already submitted; review required';exit;end if;
 end loop;
 insert into feedback_qualifications(feedback_id,user_id,project_slug,word_count,status,reason) values(new.id,new.author_user_id,new.project_slug,cw_comment_words(new.message),decision,why);
 perform cw_apply_qualification(new.id);return new;
end $$;
create trigger community_earn after insert on public.creator_feedback for each row execute function public.cw_qualify_feedback();
create function public.cw_credit_review(p_actor uuid,p_feedback uuid,p_status text,p_reason text,p_revision integer) returns void language plpgsql set search_path=public as $$
declare q feedback_qualifications%rowtype; req feedback_requests%rowtype; begin
 perform pg_advisory_xact_lock(7112026);
 if p_status not in ('qualified','rejected','revoked') or length(trim(p_reason)) not between 3 and 300 then raise exception 'Explain the decision'; end if;
 select * into q from feedback_qualifications where feedback_id=p_feedback for update;
 if not found or q.revision<>p_revision then raise exception 'Reload this review'; end if;
 if q.status=p_status then return;end if;
 if p_status='qualified' and exists(select 1 from creator_feedback where id=p_feedback and moderation_status='hidden') then raise exception 'Restore the feedback before awarding credit';end if;
 update feedback_qualifications set status=p_status,reason=trim(p_reason),reviewed_by=p_actor,revision=revision+1,updated_at=now() where feedback_id=p_feedback;
 if q.status='qualified' then
  insert into credit_ledger(user_id,event_key,amount,reason,feedback_id) values(q.user_id,'reverse:'||p_feedback||':'||(q.revision+1),-1,trim(p_reason),p_feedback);
  select * into req from feedback_requests where fulfilled_feedback_id=p_feedback and status='fulfilled' for update;
  if found then
   update feedback_requests set status='invalidated',updated_at=now() where id=req.id;
   insert into credit_ledger(user_id,event_key,amount,reason,request_id) values(req.user_id,'refund-invalid:'||req.id,1,'Removed feedback: credit returned',req.id) on conflict do nothing;
  end if;
 end if;
 if p_status='qualified' then perform cw_apply_qualification(p_feedback);end if;
 if p_actor is not null then insert into operations_log(actor_id,action,target_id,reason) values(p_actor,'credit-review.'||q.status||'.'||p_status,p_feedback,p_reason);end if;
 insert into notifications(user_id,kind,title,href) values(q.user_id,'credits','Feedback credit review: '||p_reason,'/dashboard/community');
end $$;
create function public.cw_credit_hidden() returns trigger language plpgsql set search_path=public as $$
declare q feedback_qualifications%rowtype;begin
 if new.moderation_status='hidden' and old.moderation_status<>'hidden' then
  select * into q from feedback_qualifications where feedback_id=new.id;
  if found and q.status in ('qualified','pending') then perform cw_credit_review(null,new.id,'revoked','Feedback removed by moderation',q.revision);end if;
 end if;return new;
end $$;
create trigger community_reverse after update of moderation_status on public.creator_feedback for each row execute function public.cw_credit_hidden();
create function public.cw_credit_request(p_user uuid,p_id uuid,p_slug text,p_action text) returns void language plpgsql set search_path=public as $$
declare req feedback_requests%rowtype; balance integer;begin
 perform pg_advisory_xact_lock(7112026);
 select * into req from feedback_requests where id=p_id for update;
 if found then
  if req.user_id<>p_user then raise exception 'Request not found';end if;
  if p_action='create' then return;end if;
  if p_action='cancel' and req.status='queued' then
   update feedback_requests set status='cancelled',updated_at=now() where id=p_id;
   insert into credit_ledger(user_id,event_key,amount,reason,request_id) values(p_user,'cancel:'||p_id,1,'Cancelled request: credit returned',p_id);
  end if;return;
 end if;
 if p_action<>'create' then raise exception 'Request not found';end if;
 if not exists(select 1 from projects where slug=p_slug and owner_user_id=p_user and listing_status='published') then raise exception 'Choose your published project';end if;
 select coalesce(sum(amount),0) into balance from credit_ledger where user_id=p_user;
 if balance<1 then raise exception 'Give qualifying feedback to earn a credit first';end if;
 insert into feedback_requests(id,user_id,project_slug,status) values(p_id,p_user,p_slug,'queued');
 insert into credit_ledger(user_id,event_key,amount,reason,request_id) values(p_user,'reserve:'||p_id,-1,'Credit reserved for feedback',p_id);
end $$;
create function public.cw_project_slot_guard() returns trigger language plpgsql set search_path=public as $$
declare slots integer;used integer;begin
 if new.listing_status not in ('published','in_review') or new.owner_user_id is null then return new;end if;
 perform pg_advisory_xact_lock(7112026);
 if exists(select 1 from project_slot_assignments where project_id=new.id and user_id=new.owner_user_id) then return new;end if;
 select 1+count(*) into slots from project_slot_grants where user_id=new.owner_user_id;
 select count(*) into used from project_slot_assignments where user_id=new.owner_user_id;
 if used>=slots then raise exception 'Help five different projects with qualifying feedback to unlock another project slot. Visit Community credits in your dashboard.';end if;
 insert into project_slot_assignments(project_id,user_id) values(new.id,new.owner_user_id);return new;
end $$;
create trigger community_project_slot after insert or update of listing_status,owner_user_id on public.projects for each row execute function public.cw_project_slot_guard();
-- Credit eligible feedback created before this release is preserved and counted once.
insert into feedback_qualifications(feedback_id,user_id,project_slug,word_count,status,reason)
 select f.id,f.author_user_id,f.project_slug,cw_comment_words(f.message),
 case when f.moderation_status='hidden' then 'rejected' when f.helpful='not_tried' then 'pending' else 'qualified' end,
 case when f.moderation_status='hidden' then 'Removed before community credits launched' when f.helpful='not_tried' then 'Describe a firsthand attempt before earning credit' else 'Eligible feedback from before community credits launched' end
 from creator_feedback f join projects p on p.slug=f.project_slug
 where p.owner_user_id is not null and p.owner_user_id<>f.author_user_id and cw_comment_words(f.message) between 7 and 150
 on conflict do nothing;
do $$ declare q record;begin for q in select feedback_id from feedback_qualifications where status='qualified' loop perform cw_apply_qualification(q.feedback_id);end loop;end $$;
-- Only trusted server routes may call these routines. RLS stays enabled.
do $$ declare f record;begin
 for f in select p.oid::regprocedure signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('cw_comment_words','cw_comment_guard','cw_daily_review','cw_apply_qualification','cw_qualify_feedback','cw_credit_review','cw_credit_hidden','cw_credit_request','cw_project_slot_guard') loop
  execute format('revoke all on function %s from public,anon,authenticated',f.signature);
  execute format('grant execute on function %s to service_role',f.signature);
 end loop;
end $$;
commit;
