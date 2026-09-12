-- Categories are created with a wish and become discoverable only after moderation.
-- Query all published wishes, not just the newest page, so older categories remain available.
begin;
create or replace function public.cw_wish_categories()
returns text[] language sql stable security definer set search_path=public as $$
 select coalesce(array_agg(category order by category),array[]::text[])
 from (select distinct category from public.community_wishes where moderation_status='published') categories;
$$;
revoke all on function public.cw_wish_categories() from public,anon,authenticated;
grant execute on function public.cw_wish_categories() to service_role;
commit;
