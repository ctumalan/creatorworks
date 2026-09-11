-- PREPARED LOCALLY ONLY. Review, back up, and apply separately before this code is deployed.
-- Existing wishes become pending (not public) until reviewed; no content is deleted.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';

alter table public.community_wishes
 add column moderation_status text not null default 'pending' check(moderation_status in ('pending','published','hidden')),
 add column revision integer not null default 0,
 add column reviewed_at timestamptz,
 add column reviewed_by uuid references public.users(id),
 add column moderation_reason text not null default '';
create index community_wishes_review on public.community_wishes(moderation_status,created_at);

-- Match word tokens (including apostrophes and hyphens), not whitespace-delimited chunks.
create function public.cw_wish_words(p_text text) returns integer language sql immutable as $$
 select count(*)::integer from regexp_matches(coalesce(p_text,''),'[[:alnum:]]+([''’-][[:alnum:]]+)*','g');
$$;

create function public.cw_submit_wish(p_user uuid,p_category text,p_description text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare existing community_wishes%rowtype; wish_id uuid;
begin
 -- Lock the member, not a count result: parallel submissions cannot exceed the cap.
 perform 1 from users where id=p_user and account_status='active' for update;
 if not found then raise exception 'Active account required';end if;
 if p_category is null or length(trim(p_category)) not between 2 and 48 or p_description is null or length(trim(p_description))>180 or cw_wish_words(p_description) not between 4 and 11 then raise exception 'Invalid wish';end if;
 select * into existing from community_wishes where user_id=p_user and category=p_category and description=trim(p_description);
 if found then return jsonb_build_object('outcome','duplicate','status',existing.moderation_status);end if;
 if (select count(*) from community_wishes where user_id=p_user and moderation_status in ('pending','published'))>=10 then return jsonb_build_object('outcome','limit');end if;
 insert into community_wishes(user_id,category,description) values(p_user,p_category,trim(p_description)) returning id into wish_id;
 return jsonb_build_object('outcome','submitted','status','pending');
end $$;

create function public.cw_review_wish(p_actor uuid,p_founder text,p_id uuid,p_revision integer,p_status text,p_reason text)
returns void language plpgsql security definer set search_path=public as $$
declare item community_wishes%rowtype;
begin
 if not exists(select 1 from users where id=p_actor and workos_user_id=p_founder and account_status='active') then raise exception 'Not allowed';end if;
 if p_status is null or p_status not in ('published','hidden') or p_reason is null or length(trim(p_reason)) not between 3 and 300 then raise exception 'Explain the decision';end if;
 select * into item from community_wishes where id=p_id for update;
 if not found or p_revision is null or item.revision<>p_revision then raise exception 'Reload this review';end if;
 update community_wishes set moderation_status=p_status,revision=revision+1,reviewed_at=now(),reviewed_by=p_actor,moderation_reason=trim(p_reason) where id=p_id;
 insert into operations_log(actor_id,action,target_id,reason) values(p_actor,'wish.'||p_status,p_id,trim(p_reason));
end $$;
revoke all on function public.cw_submit_wish(uuid,text,text) from public,anon,authenticated;
revoke all on function public.cw_wish_words(text) from public,anon,authenticated;
revoke all on function public.cw_review_wish(uuid,text,uuid,integer,text,text) from public,anon,authenticated;
grant execute on function public.cw_submit_wish(uuid,text,text) to service_role;
grant execute on function public.cw_review_wish(uuid,text,uuid,integer,text,text) to service_role;

-- Keep explicit choices separate from cw_record_category_interest's learned ranking.
-- Preserve the currently stored interests; previously overwritten choices cannot be recovered here.
alter table public.account_preferences add column selected_interests text[] not null default '{}';
update public.account_preferences set selected_interests=interests;
commit;
