-- CreatorWorks only. Additive; no existing users or comments are changed.
begin;
create table if not exists public.admin_activity (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references public.users(id),
  target_id uuid not null,
  action text not null,
  previous_status text not null,
  new_status text not null,
  reason text not null check (length(reason) between 3 and 300),
  created_at timestamptz not null default now()
);
alter table public.admin_activity enable row level security;
revoke all on public.admin_activity from anon, authenticated;
grant select, insert on public.admin_activity to service_role;

create or replace function public.cw_review_comment(p_actor uuid, p_id uuid, p_status text, p_previous text, p_expected text, p_reason text)
returns void language plpgsql security invoker set search_path = public as $$
declare current_comment public.project_experiences%rowtype;
begin
  if p_status not in ('published','hidden','pending') or length(trim(p_reason)) not between 3 and 300 then
    raise exception 'Invalid review';
  end if;
  select * into current_comment from public.project_experiences where id = p_id for update;
  if not found or current_comment.response is distinct from p_expected or current_comment.moderation_status is distinct from p_previous then
    raise exception 'Comment changed; reload before reviewing';
  end if;
  update public.project_experiences set moderation_status = p_status where id = p_id;
  insert into public.admin_activity(actor_user_id,target_id,action,previous_status,new_status,reason)
  values(p_actor,p_id,'comment.review',current_comment.moderation_status,p_status,trim(p_reason));
end; $$;
revoke all on function public.cw_review_comment(uuid,uuid,text,text,text,text) from public, anon, authenticated;
grant execute on function public.cw_review_comment(uuid,uuid,text,text,text,text) to service_role;
commit;
