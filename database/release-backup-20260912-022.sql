-- One-time private snapshot before 022. Do not replay after migration.
begin;
set local lock_timeout='5s';
set local statement_timeout='60s';
do $$ begin
 if exists(select 1 from information_schema.columns where table_schema='public' and table_name='project_experiences' and column_name='guest_hash')
 then raise exception '022 has already changed this table; inspect before continuing';end if;
end $$;
lock table public.project_experiences in share mode;
create schema release_backup_20260912_022;
revoke all on schema release_backup_20260912_022 from public,anon,authenticated,service_role;
create table release_backup_20260912_022.project_experiences (like public.project_experiences including all);
insert into release_backup_20260912_022.project_experiences select * from public.project_experiences;
create table release_backup_20260912_022.metadata as select now() captured_at,
 '022; existing public comments only. Use a reviewed forward fix; managed full backup remains the disaster-recovery route.'::text recovery_scope,
 'Review and remove this private snapshot after release acceptance; target within seven days.'::text retention_note;
revoke all on all tables in schema release_backup_20260912_022 from public,anon,authenticated,service_role;
alter table release_backup_20260912_022.project_experiences enable row level security;
alter table release_backup_20260912_022.metadata enable row level security;
do $$ begin
 if exists((table public.project_experiences except table release_backup_20260912_022.project_experiences)
 union all (table release_backup_20260912_022.project_experiences except table public.project_experiences))
 then raise exception 'Snapshot verification failed';end if;
end $$;
commit;
select captured_at,(select count(*) from release_backup_20260912_022.project_experiences) comments_backed_up,
 not has_schema_privilege('anon','release_backup_20260912_022','USAGE') and
 not has_schema_privilege('authenticated','release_backup_20260912_022','USAGE') and
 not has_schema_privilege('service_role','release_backup_20260912_022','USAGE') private_snapshot
 from release_backup_20260912_022.metadata;
