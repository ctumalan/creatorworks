-- Keep existing daily comments in the general discussion (empty category).
-- Apply separately after review; this file does not run during website deployment.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';
alter table public.daily_discussion_comments add column category text not null default '' check(length(category)<=80);
alter table public.daily_discussion_comments drop constraint daily_discussion_comments_user_id_day_key_key;
alter table public.daily_discussion_comments add constraint daily_discussion_member_day_category unique(user_id,day_key,category);
create index category_discussion_public on public.daily_discussion_comments(category,created_at desc) where moderation_status='published';
-- Existing RLS, moderation procedures and comment validation remain in force.
commit;
