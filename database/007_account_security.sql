-- Prepared only. Requires separate approval before applying to CreatorWorks.
begin;
create table if not exists public.account_deletion_requests (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null unique references public.users(id),
 requested_at timestamptz not null default now(),
 status text not null default 'pending' check (status in ('pending','cancelled')),
 updated_at timestamptz not null default now()
);
alter table public.account_deletion_requests enable row level security;
revoke all on public.account_deletion_requests from anon, authenticated;
grant select, insert, update on public.account_deletion_requests to service_role;
commit;
