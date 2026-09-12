-- Apply only after backup/review. Does not publish, hide, or delete existing records.
begin;
set local lock_timeout='5s';
set local statement_timeout='60s';
-- Build metadata uses a generic settings table. Give it the same row-lock
-- protection as a foreign key so a concurrent save cannot outlive deletion.
create function public.cw_guard_build_project() returns trigger language plpgsql set search_path=public as $$
begin
 perform 1 from projects where id=split_part(new.key,':',2)::uuid for key share;
 if not found then raise exception 'Project no longer exists';end if;
 return new;
end $$;
create trigger workspace_build_project before insert or update on public.site_settings
for each row when (new.key like 'project-builds:%') execute function public.cw_guard_build_project();
revoke all on function public.cw_guard_build_project() from public,anon,authenticated;
create function public.cw_workspace_inbox(p_user uuid,p_project text default '',p_unread boolean default false,p_page integer default 0,p_sort text default 'newest')
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
 select t.*,count(*) over() from threads t where not p_unread or t.unread
 order by case when p_sort='oldest' then t.last_at end asc,
 case when p_sort='project' then lower(t.title) end asc,
 case when p_sort<>'oldest' then t.last_at end desc,t.id
 limit 25 offset least(greatest(p_page,0),10000)*25;
$$;
create function public.cw_project_unread(p_user uuid)
returns table(slug text,unread_count bigint) language sql stable set search_path=public as $$
 select p.slug,(select count(*) from creator_feedback f
 left join feedback_reads rd on rd.feedback_id=f.id and rd.user_id=p_user
 where f.project_slug=p.slug and (f.author_user_id<>p_user and f.created_at>coalesce(rd.read_at,'-infinity'::timestamptz)
 or exists(select 1 from feedback_replies r where r.feedback_id=f.id and r.author_user_id<>p_user and r.created_at>coalesce(rd.read_at,'-infinity'::timestamptz))))
 from projects p where p.owner_user_id=p_user and exists(select 1 from users where id=p_user and account_status='active');
$$;
create function public.cw_delete_unused_draft(p_user uuid,p_id uuid,p_version integer)
returns text language plpgsql set search_path=public as $$
declare item projects%rowtype;
begin
 if not exists(select 1 from users where id=p_user and account_status='active') then raise exception 'Active account required';end if;
 select * into item from projects where id=p_id and owner_user_id=p_user for update;
 if not found or p_version is null or item.lock_version<>p_version then raise exception 'Reload this draft';end if;
 if item.is_studio or item.listing_status<>'draft' or item.published_at is not null then raise exception 'Only unused private drafts can be deleted';end if;
 if exists(select 1 from saved_projects where project_slug=item.slug)
 or exists(select 1 from project_experiences where project_slug=item.slug)
 or exists(select 1 from creator_feedback where project_slug=item.slug)
 or exists(select 1 from project_review_history where project_id=p_id)
 or exists(select 1 from feedback_requests where project_slug=item.slug)
 or exists(select 1 from project_slot_assignments where project_id=p_id)
 or exists(select 1 from site_settings where key='project-builds:'||p_id::text)
 then raise exception 'Project history must be retained; unpublish instead';end if;
 insert into operations_log(actor_id,target_id,action,reason) values(p_user,p_id,'project.delete_unused_draft','Owner confirmed deletion of an unused private draft');
 delete from projects where id=p_id;
 return item.preview_path;
end $$;
revoke all on function public.cw_workspace_inbox(uuid,text,boolean,integer,text),public.cw_project_unread(uuid),public.cw_delete_unused_draft(uuid,uuid,integer) from public,anon,authenticated;
grant execute on function public.cw_workspace_inbox(uuid,text,boolean,integer,text),public.cw_project_unread(uuid),public.cw_delete_unused_draft(uuid,uuid,integer) to service_role;
commit;
