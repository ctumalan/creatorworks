-- Local release preparation only: apply before enabling public wish submissions.
begin;
create table public.community_wishes (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.users(id) on delete cascade,
 category text not null check(length(category)<=48),
 description text not null check(length(description)<=180),
 created_at timestamptz not null default now(),
 unique(user_id,category,description)
);
alter table public.community_wishes enable row level security;
revoke all on public.community_wishes from anon, authenticated;
create index community_wishes_category_created on public.community_wishes(category,created_at desc);
create function public.cw_remove_member_wishes() returns trigger
language plpgsql security definer set search_path=public as $$
begin
 if new.account_status='deleted' then delete from community_wishes where user_id=new.id; end if;
 return new;
end $$;
revoke all on function public.cw_remove_member_wishes() from public;
create trigger remove_member_wishes after update of account_status on public.users
for each row execute function public.cw_remove_member_wishes();
commit;
