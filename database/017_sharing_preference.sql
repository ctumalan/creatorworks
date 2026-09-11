-- Apply with the next approved release, before deploying the matching code.
begin;
alter table public.projects add column sharing_preference text not null default 'not_sure'
 check(sharing_preference in ('private','public','not_sure'));
-- Existing public/reviewed listings retain their previously expressed intent.
update public.projects set sharing_preference='public' where listing_status in ('published','in_review');
commit;
