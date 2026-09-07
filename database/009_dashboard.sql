-- CreatorWorks dashboard expansion. Additive; no existing account is suspended or erased.
begin;
alter table public.users add column if not exists account_status text not null default 'active' check(account_status in ('active','suspended','deleted'));
alter table public.profiles add column if not exists website text not null default '';
alter table public.profiles add column if not exists verified boolean not null default false;
create table if not exists public.account_preferences(
 user_id uuid primary key references public.users(id),
 feedback_alerts boolean not null default true, publication_alerts boolean not null default true,
 tips boolean not null default true, interests text[] not null default '{}', updated_at timestamptz not null default now()
);
create table if not exists public.notifications(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id),
 kind text not null, title text not null, href text not null, read_at timestamptz, created_at timestamptz not null default now()
);
create index if not exists notifications_user_time on public.notifications(user_id,created_at desc);
create table if not exists public.support_cases(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id),
 kind text not null check(kind in ('support','report','copyright','appeal','verification')),
 subject text not null check(length(subject) between 3 and 120), message text not null check(length(message) between 10 and 4000),
 project_slug text, status text not null default 'open' check(status in ('open','waiting','resolved')),
 revision integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.support_messages(
 id uuid primary key default gen_random_uuid(), case_id uuid not null references public.support_cases(id),
 author_id uuid not null references public.users(id), is_staff boolean not null default false,
 message text not null check(length(message) between 1 and 4000), request_id uuid not null unique,
 created_at timestamptz not null default now()
);
create table if not exists public.site_settings(key text primary key,value jsonb not null,updated_at timestamptz not null default now());
create table if not exists public.operations_log(
 id uuid primary key default gen_random_uuid(), actor_id uuid not null references public.users(id), target_id uuid,
 action text not null, reason text not null default '', created_at timestamptz not null default now()
);
create table if not exists public.erasure_jobs(
 user_id uuid primary key references public.users(id), workos_id text not null, paths text[] not null default '{}',
 status text not null default 'pending' check(status in ('pending','complete')), created_at timestamptz not null default now(), completed_at timestamptz
);
alter table public.account_deletion_requests add column if not exists erasure_consent boolean not null default false;
alter table public.account_deletion_requests drop constraint if exists account_deletion_requests_status_check;
alter table public.account_deletion_requests add constraint account_deletion_requests_status_check check(status in ('pending','cancelled','processing','complete'));
do $$ declare t text; begin
 foreach t in array array['account_preferences','notifications','support_cases','support_messages','site_settings','operations_log','erasure_jobs'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon, authenticated',t);
 execute format('grant all on public.%I to service_role',t);
 end loop;
end $$;
-- Keep notifications in the same transaction as the event, including retried requests.
create or replace function public.cw_notify_changes() returns trigger language plpgsql security definer set search_path=public as $$
declare recipient uuid; alert_kind text; alert_title text; link text; enabled boolean;
begin
 if TG_TABLE_NAME='creator_feedback' then
  select owner_user_id into recipient from projects where slug=new.project_slug;
  alert_kind='feedback'; alert_title='New project feedback'; link='/dashboard/thread/'||new.id;
 elsif TG_TABLE_NAME='feedback_replies' then
  select case when new.author_user_id=f.author_user_id then p.owner_user_id else f.author_user_id end into recipient from creator_feedback f join projects p on p.slug=f.project_slug where f.id=new.feedback_id;
  alert_kind='feedback'; alert_title='New reply to your conversation'; link='/dashboard/thread/'||new.feedback_id;
 elsif TG_TABLE_NAME='projects' then
  if new.listing_status is not distinct from old.listing_status then return new; end if;
  recipient=new.owner_user_id; alert_kind='publication'; alert_title=case new.listing_status when 'published' then 'Your project is published' when 'in_review' then 'Your project is awaiting review' when 'draft' then 'Your project is a draft' else 'Your project was unpublished' end; link='/?listing=settings&project='||new.slug;
 else return new;
 end if;
 if recipient is null then return new; end if;
 select case when alert_kind='feedback' then feedback_alerts else publication_alerts end into enabled from account_preferences where user_id=recipient;
 if coalesce(enabled,true) then insert into notifications(user_id,kind,title,href) values(recipient,alert_kind,alert_title,link); end if;
 return new;
end $$;
drop trigger if exists cw_feedback_notify on public.creator_feedback;
create trigger cw_feedback_notify after insert on public.creator_feedback for each row execute function public.cw_notify_changes();
drop trigger if exists cw_reply_notify on public.feedback_replies;
create trigger cw_reply_notify after insert on public.feedback_replies for each row execute function public.cw_notify_changes();
drop trigger if exists cw_project_notify on public.projects;
create trigger cw_project_notify after update of listing_status on public.projects for each row execute function public.cw_notify_changes();
-- Atomic case reply and status transition. The caller must be the owner or configured founder.
create or replace function public.cw_case_reply(p_actor uuid,p_case uuid,p_request uuid,p_message text,p_staff boolean,p_founder text,p_revision integer,p_status text)
returns void language plpgsql security definer set search_path=public as $$
declare c support_cases%rowtype; staff boolean;
begin
 select workos_user_id=p_founder into staff from users where id=p_actor and account_status='active';
 select * into c from support_cases where id=p_case for update;
 if not found or (c.user_id<>p_actor and not coalesce(staff,false)) then raise exception 'Not allowed'; end if;
 if p_staff and not coalesce(staff,false) then raise exception 'Not allowed'; end if;
 if exists(select 1 from support_messages where request_id=p_request and author_id=p_actor and case_id=p_case) then return; end if;
 if c.revision<>p_revision then raise exception 'Case changed. Reload before replying.'; end if;
 if p_status not in ('open','waiting','resolved') or length(trim(p_message)) not between 1 and 4000 then raise exception 'Invalid reply'; end if;
 insert into support_messages(case_id,author_id,is_staff,message,request_id) values(p_case,p_actor,p_staff,trim(p_message),p_request);
 update support_cases set status=case when p_staff then p_status else 'open' end,revision=revision+1,updated_at=now() where id=p_case;
 if p_staff then
 insert into notifications(user_id,kind,title,href) values(c.user_id,'support','Support has replied','/dashboard/help?case='||p_case);
 insert into operations_log(actor_id,target_id,action,reason) values(p_actor,p_case,'support.'||p_status,'Reply sent');
 end if;
end $$;
-- Atomically redact account content and queue external identity/media cleanup. Never deletes another participant's messages.
create or replace function public.cw_erase_account(p_actor uuid,p_user uuid,p_founder text)
returns void language plpgsql security definer set search_path=public as $$
declare target users%rowtype; staff boolean; approved boolean;
begin
 select workos_user_id=p_founder into staff from users where id=p_actor and account_status='active';
 if not coalesce(staff,false) then raise exception 'Not allowed'; end if;
 select * into target from users where id=p_user for update;
 if not found or target.workos_user_id=p_founder or target.system_role='admin' then raise exception 'Protected account'; end if;
 select status in ('pending','processing') and erasure_consent into approved from account_deletion_requests where user_id=p_user for update;
 if not coalesce(approved,false) then raise exception 'No pending deletion request'; end if;
 insert into erasure_jobs(user_id,workos_id,paths) values(p_user,target.workos_user_id,array(select preview_path from projects where owner_user_id=p_user and preview_path<>'' and preview_path not like '/assets/%')) on conflict(user_id) do nothing;
 update users set account_status='deleted' where id=p_user;
 update profiles set display_name='Deleted member',identity_label='',bio='',avatar_path=null,website='',is_public=false,verified=false where user_id=p_user;
 update projects set title='Removed project',tagline='',link_note='',outcome='',access_note='',creator_slug='',client_token=null,summary='',headline='',help_text='',first_try='',purpose='',audience='',external_url='',preview_path='',preview_public_url='',video_url='',note='',benefits='[]',listing_status='unpublished',visibility='draft',lock_version=lock_version+1,updated_at=now() where owner_user_id=p_user;
 update creator_feedback set message='',moderation_status='hidden' where author_user_id=p_user;
 update feedback_replies set message='[Removed by account deletion]' where author_user_id=p_user;
 update project_experiences set response='[Removed by account deletion]',moderation_status='hidden' where author_user_id=p_user;
 update support_cases set subject='Deleted account request',message='[Removed by account deletion]',status='resolved' where user_id=p_user;
 update support_messages set message='[Removed by account deletion]' where author_id=p_user;
 delete from saved_projects where user_id=p_user;
 delete from account_preferences where user_id=p_user;
 delete from notifications where user_id=p_user;
 update account_deletion_requests set status='processing',updated_at=now() where user_id=p_user;
 insert into operations_log(actor_id,target_id,action,reason) values(p_actor,p_user,'account.erasure_started','Verified account-holder deletion request');
end $$;
revoke all on function public.cw_notify_changes() from public,anon,authenticated;
revoke all on function public.cw_case_reply(uuid,uuid,uuid,text,boolean,text,integer,text) from public,anon,authenticated;
revoke all on function public.cw_erase_account(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.cw_case_reply(uuid,uuid,uuid,text,boolean,text,integer,text) to service_role;
grant execute on function public.cw_erase_account(uuid,uuid,text) to service_role;
-- Audited account administration, protected against stale forms and privilege changes.
create or replace function public.cw_manage_member(p_actor uuid,p_target uuid,p_founder text,p_action text,p_expected text,p_reason text)
returns void language plpgsql security definer set search_path=public as $$
declare t users%rowtype;
begin
 if not exists(select 1 from users where id=p_actor and workos_user_id=p_founder and account_status='active') then raise exception 'Not allowed'; end if;
 select * into t from users where id=p_target for update;
 if not found or t.workos_user_id=p_founder or t.system_role='admin' or t.account_status='deleted' then raise exception 'Protected account'; end if;
 if length(trim(p_reason)) not between 3 and 300 then raise exception 'Reason required'; end if;
 if p_action in ('suspend','reactivate') then
  if t.account_status<>p_expected then raise exception 'Account changed'; end if;
  update users set account_status=case p_action when 'suspend' then 'suspended' else 'active' end where id=p_target;
 elsif p_action in ('verify','unverify') then
  if t.account_status<>'active' then raise exception 'Active account required'; end if;
  update profiles set verified=(p_action='verify') where user_id=p_target;
 else raise exception 'Invalid action'; end if;
 insert into operations_log(actor_id,target_id,action,reason) values(p_actor,p_target,'account.'||p_action,trim(p_reason));
end $$;
revoke all on function public.cw_manage_member(uuid,uuid,text,text,text,text) from public,anon,authenticated;
grant execute on function public.cw_manage_member(uuid,uuid,text,text,text,text) to service_role;
commit;
