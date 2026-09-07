begin;
alter table public.projects add column if not exists video_url text not null default '';
create table if not exists public.request_limits (
 key text primary key, hits integer not null, expires_at timestamptz not null
);
alter table public.request_limits enable row level security;
revoke all on public.request_limits from anon, authenticated;
grant all on public.request_limits to service_role;
create or replace function public.cw_rate_limit(p_key text, p_limit integer, p_seconds integer)
returns boolean language plpgsql security definer set search_path=public as $$
declare n integer;
begin
 delete from request_limits where expires_at < now() - interval '1 day';
 insert into request_limits(key,hits,expires_at) values(p_key,1,now()+make_interval(secs=>p_seconds))
 on conflict(key) do update set hits=case when request_limits.expires_at<=now() then 1 else request_limits.hits+1 end,
 expires_at=case when request_limits.expires_at<=now() then now()+make_interval(secs=>p_seconds) else request_limits.expires_at end
 returning hits into n;
 return n<=p_limit;
end; $$;
revoke all on function public.cw_rate_limit(text,integer,integer) from public, anon, authenticated;
grant execute on function public.cw_rate_limit(text,integer,integer) to service_role;
commit;
