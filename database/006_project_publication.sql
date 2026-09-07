-- CreatorWorks 006: project preview storage + atomic publication review.
-- Additive and idempotent. Apply ONLY to the separate CreatorWorks database (ref nkrkmfszuntvzjonrznb).
begin;

-- Private bucket for creator-uploaded/captured project previews. Not public: images are served
-- through the server, which allows anyone only for published listings and the owner/admin otherwise.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-previews', 'project-previews', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
-- The bucket is private: only the server's service role reads/writes objects, and it serves images
-- through /api/project-image with per-request authorization. No anon/authenticated policies are added,
-- so nothing here changes access to any other (e.g. avatar) bucket.

-- Audit trail for publication decisions (creator submissions and administrator approvals).
create table if not exists public.project_review_history (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  actor_user_id uuid not null references public.users(id),
  action text not null,
  previous_status text not null,
  new_status text not null,
  reason text not null default '',
  created_at timestamptz not null default now()
);
alter table public.project_review_history enable row level security;
revoke all on public.project_review_history from anon, authenticated;
grant select, insert on public.project_review_history to service_role;

-- Atomic administrator decision on a submitted project, bound to the EXACT revision the admin reviewed.
-- The decision is rejected unless BOTH the prior status AND the lock_version still match what the review
-- form displayed — so an approval from a stale screen (after a withdraw → edit → resubmit) cannot land.
-- This also prevents double-publish from retries/double-clicks. The server verifies admin identity first.
drop function if exists public.cw_review_project(uuid,uuid,text,text,text);
create or replace function public.cw_review_project(p_actor uuid, p_id uuid, p_previous text, p_expected_version integer, p_status text, p_reason text)
returns void language plpgsql security invoker set search_path = public as $$
declare item public.projects%rowtype;
begin
  if p_status not in ('published','unpublished','in_review','draft')
     or length(trim(coalesce(p_reason,''))) > 300 then raise exception 'Invalid project decision'; end if;
  select * into item from public.projects where id = p_id for update;
  if not found then raise exception 'Project not found'; end if;
  if item.listing_status is distinct from p_previous or item.lock_version is distinct from p_expected_version then
    raise exception 'Project changed; reload before deciding';
  end if;
  update public.projects set
    listing_status = p_status,
    visibility = case when p_status = 'published' then 'public' else 'draft' end,
    published_at = case when p_status = 'published' then coalesce(item.published_at, now()) else item.published_at end,
    lock_version = item.lock_version + 1,
    updated_at = now()
  where id = p_id and listing_status = p_previous and lock_version = p_expected_version;
  if not found then raise exception 'Project changed; reload before deciding'; end if;
  insert into public.project_review_history(project_id, actor_user_id, action, previous_status, new_status, reason)
  values (p_id, p_actor, 'project.review', item.listing_status, p_status, trim(coalesce(p_reason,'')));
end; $$;
revoke all on function public.cw_review_project(uuid,uuid,text,integer,text,text) from public, anon, authenticated;
grant execute on function public.cw_review_project(uuid,uuid,text,integer,text,text) to service_role;

commit;
