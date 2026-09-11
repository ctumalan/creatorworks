-- The public API authenticates writes and serves only public wish fields.
-- Retain RLS and no direct browser-role access; permit the existing server role.
begin;
grant select, insert, update, delete on public.community_wishes to service_role;
commit;
