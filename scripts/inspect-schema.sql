-- CreatorWorks read-only schema introspection. Safe to run before any migration: it references only
-- information_schema/pg_catalog and never assumes a table or column (e.g. projects.listing_status) exists.
-- Run in the Supabase SQL editor for the CreatorWorks project (ref nkrkmfszuntvzjonrznb) and share output.

-- 1) Which tables exist in public.
select table_name
  from information_schema.tables
  where table_schema = 'public'
  order by table_name;

-- 2) Which cw_* functions exist, with their EXACT argument signatures. This distinguishes the older
--    cw_review_project(uuid,uuid,text,text,text) from the revision-bound
--    cw_review_project(uuid,uuid,text,integer,text,text) so we can reconcile 006 against live state.
select p.proname as function_name, pg_get_function_identity_arguments(p.oid) as argument_types
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.proname like 'cw_%'
  order by p.proname, argument_types;

-- 3) Columns that actually exist on the tables this milestone touches (missing tables simply return no rows).
select table_name, column_name, data_type
  from information_schema.columns
  where table_schema = 'public'
    and table_name in ('projects','profiles','users','saved_projects',
                       'project_experiences','creator_feedback','feedback_replies',
                       'admin_activity','feedback_review_history','project_review_history')
  order by table_name, ordinal_position;

-- 3b) Storage buckets and how many objects each holds. Do NOT assume the preview bucket is empty/absent.
select id, name, public, file_size_limit, allowed_mime_types
  from storage.buckets order by id;
select bucket_id, count(*) as object_count
  from storage.objects group by bucket_id order by bucket_id;

-- 4) Ownership/lifecycle snapshot — column-tolerant: reads listing_status / owner_user_id only if present.
do $$
declare has_status boolean; has_owner boolean; rec record;
begin
  select count(*) > 0 into has_status from information_schema.columns
    where table_schema='public' and table_name='projects' and column_name='listing_status';
  select count(*) > 0 into has_owner from information_schema.columns
    where table_schema='public' and table_name='projects' and column_name='owner_user_id';
  if not exists (select 1 from information_schema.tables where table_schema='public' and table_name='projects') then
    raise notice 'projects table does not exist yet';
  else
    for rec in execute format(
      'select slug, %s as listing_status, %s as owner from public.projects order by slug',
      case when has_status then 'listing_status' else quote_literal('(no listing_status column)') end,
      case when has_owner then $q$case when owner_user_id is null then 'NULL' else 'SET' end$q$ else quote_literal('(no owner_user_id column)') end)
    loop
      raise notice 'project % status=% owner=%', rec.slug, rec.listing_status, rec.owner;
    end loop;
  end if;
end $$;

-- 5) Row counts for the records a backup must cover (tolerant: skips tables that do not exist yet).
do $$
declare t text; n bigint;
begin
  foreach t in array array['users','profiles','projects','saved_projects','project_experiences',
                           'creator_feedback','feedback_replies','admin_activity','feedback_review_history','project_review_history']
  loop
    if to_regclass('public.'||t) is not null then
      execute format('select count(*) from public.%I', t) into n;
      raise notice 'rows in % = %', t, n;
    else
      raise notice 'table % does not exist', t;
    end if;
  end loop;
end $$;
