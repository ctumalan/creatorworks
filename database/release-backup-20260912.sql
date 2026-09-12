-- Supplemental, release-scoped snapshot. The managed full backup remains the disaster-recovery route.
-- Only the two tables whose existing rows/columns are affected by 019 are copied.
-- Private, no browser/server-role access, no API exposure, no original data deletion.
begin;
set local lock_timeout='5s';
set local statement_timeout='60s';
do $$ begin
 if exists(select 1 from information_schema.columns where table_schema='public' and
 ((table_name='community_wishes' and column_name in ('moderation_status','revision')) or
 (table_name='account_preferences' and column_name='selected_interests')))
 or exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public' and p.proname in ('cw_wish_words','cw_submit_wish','cw_review_wish','cw_guard_build_project','cw_workspace_inbox','cw_project_unread','cw_delete_unused_draft','cw_wish_categories'))
 then raise exception 'Release schema already exists in whole or part; inspect before continuing';end if;
end $$;
lock table public.community_wishes,public.account_preferences in share mode;
create schema release_backup_20260912;
revoke all on schema release_backup_20260912 from public,anon,authenticated,service_role;
create table release_backup_20260912.community_wishes (like public.community_wishes including all);
insert into release_backup_20260912.community_wishes select * from public.community_wishes;
create table release_backup_20260912.account_preferences (like public.account_preferences including all);
insert into release_backup_20260912.account_preferences select * from public.account_preferences;
create table release_backup_20260912.metadata as select now() captured_at,
 '019-021; restore affected rows with a reviewed forward fix, not an automatic full rollback'::text recovery_scope,
 'Review and remove this temporary snapshot after release acceptance; target within seven days'::text retention_note;
revoke all on all tables in schema release_backup_20260912 from public,anon,authenticated,service_role;
alter table release_backup_20260912.community_wishes enable row level security;
alter table release_backup_20260912.account_preferences enable row level security;
alter table release_backup_20260912.metadata enable row level security;
do $$ begin
 if exists((table public.community_wishes except table release_backup_20260912.community_wishes)
 union all (table release_backup_20260912.community_wishes except table public.community_wishes))
 or exists((table public.account_preferences except table release_backup_20260912.account_preferences)
 union all (table release_backup_20260912.account_preferences except table public.account_preferences))
 then raise exception 'Snapshot verification failed';end if;
end $$;
commit;
select captured_at,(select count(*) from release_backup_20260912.community_wishes) wishes_backed_up,
 (select count(*) from release_backup_20260912.account_preferences) preferences_backed_up,
 not has_schema_privilege('anon','release_backup_20260912','USAGE') and
 not has_schema_privilege('authenticated','release_backup_20260912','USAGE') and
 not has_schema_privilege('service_role','release_backup_20260912','USAGE') private_snapshot
 from release_backup_20260912.metadata;
