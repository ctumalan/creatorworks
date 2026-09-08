begin;

alter table public.account_preferences add column if not exists personalization boolean not null default true;

create table if not exists public.category_engagement(
 user_id uuid not null references public.users(id) on delete cascade,
 category text not null check(length(category) between 2 and 48),
 clicks integer not null default 1 check(clicks between 1 and 1000000000),
 updated_at timestamptz not null default now(),
 primary key(user_id,category)
);
alter table public.category_engagement enable row level security;
revoke all on public.category_engagement from anon,authenticated;
grant select,insert,update,delete on public.category_engagement to service_role;

create or replace function public.cw_record_category_interest(p_user uuid,p_category text)
returns void language plpgsql security definer set search_path=public as $$
declare enabled boolean;
begin
 select personalization into enabled from account_preferences where user_id=p_user;
 if coalesce(enabled,true)=false then return;end if;
 if length(trim(p_category)) not between 2 and 48 or not exists(select 1 from projects where category=trim(p_category) and listing_status='published') then raise exception 'Invalid category';end if;
 insert into category_engagement(user_id,category,clicks) values(p_user,trim(p_category),1)
 on conflict(user_id,category) do update set clicks=least(category_engagement.clicks+1,1000000000),updated_at=now();
 insert into account_preferences(user_id) values(p_user) on conflict(user_id) do nothing;
 update account_preferences set interests=array(select category from category_engagement where user_id=p_user order by clicks desc,updated_at desc,category limit 10),updated_at=now() where user_id=p_user;
end $$;

-- Founder-only permanent removal. The user-facing deletion path remains a separate consented flow.
create or replace function public.cw_admin_erase_account(p_actor uuid,p_user uuid,p_founder text,p_reason text)
returns void language plpgsql security definer set search_path=public as $$
declare target users%rowtype;
begin
 if not exists(select 1 from users where id=p_actor and workos_user_id=p_founder and account_status='active') then raise exception 'Not allowed';end if;
 select * into target from users where id=p_user for update;
 if not found or target.workos_user_id=p_founder or target.system_role='admin' or target.account_status='deleted' then raise exception 'Protected account';end if;
 if length(trim(p_reason)) not between 10 and 300 then raise exception 'Detailed reason required';end if;
 insert into erasure_jobs(user_id,workos_id,paths) values(p_user,target.workos_user_id,array(select preview_path from projects where owner_user_id=p_user and preview_path<>'' and preview_path not like '/assets/%'))
 on conflict(user_id) do update set workos_id=excluded.workos_id,paths=excluded.paths,status='pending',completed_at=null;
 update users set account_status='deleted' where id=p_user;
 update profiles set display_name='Deleted member',identity_label='',bio='',avatar_path=null,website='',is_public=false,verified=false where user_id=p_user;
 update projects set title='Removed project',tagline='',link_note='',outcome='',access_note='',creator_slug='',client_token=null,summary='',headline='',help_text='',first_try='',purpose='',audience='',external_url='',preview_path='',preview_public_url='',video_url='',note='',benefits='[]',listing_status='unpublished',visibility='draft',lock_version=lock_version+1,updated_at=now() where owner_user_id=p_user;
 update creator_feedback set message='',moderation_status='hidden' where author_user_id=p_user;
 update feedback_replies set message='[Removed by account deletion]' where author_user_id=p_user;
 update project_experiences set response='[Removed by account deletion]',moderation_status='hidden' where author_user_id=p_user;
 update support_cases set subject='Deleted account request',message='[Removed by account deletion]',status='resolved' where user_id=p_user;
 update support_messages set message='[Removed by account deletion]' where author_id=p_user;
 update daily_discussion_comments set message='[Removed by account deletion]',moderation_status='hidden' where user_id=p_user;
 delete from saved_projects where user_id=p_user;
 delete from account_preferences where user_id=p_user;
 delete from category_engagement where user_id=p_user;
 delete from notifications where user_id=p_user;
 insert into operations_log(actor_id,target_id,action,reason) values(p_actor,p_user,'account.admin_erasure_started',trim(p_reason));
end $$;

revoke all on function public.cw_record_category_interest(uuid,text) from public,anon,authenticated;
revoke all on function public.cw_admin_erase_account(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.cw_record_category_interest(uuid,text) to service_role;
grant execute on function public.cw_admin_erase_account(uuid,uuid,text,text) to service_role;
commit;
