begin;
-- Request reservations, refunds and fulfillment entries are not earnings.
-- Reward reversals remain part of lifetime earnings, so invalid credits do not qualify.
create function public.cw_verification_progress(p_user uuid)
returns table(earned bigint,has_published boolean,verified boolean,case_id uuid)
language sql stable set search_path=public as $$
 select greatest(0,coalesce((select sum(amount) from credit_ledger where user_id=p_user and request_id is null),0))::bigint,
 exists(select 1 from projects where owner_user_id=p_user and listing_status='published'),
 coalesce((select p.verified from profiles p where p.user_id=p_user),false),
 (select id from support_cases where user_id=p_user and kind='verification' and status in ('open','waiting') order by created_at desc limit 1);
$$;
create function public.cw_request_verification(p_user uuid,p_id uuid,p_subject text,p_message text,p_project text)
returns uuid language plpgsql set search_path=public as $$
declare progress record; existing support_cases%rowtype;
begin
 perform pg_advisory_xact_lock(7112026);
 if not exists(select 1 from users where id=p_user and account_status='active') then raise exception 'Active membership required';end if;
 select * into progress from cw_verification_progress(p_user);
 if progress.case_id is not null then return progress.case_id;end if;
 select * into existing from support_cases where id=p_id;
 if found then
  if existing.user_id=p_user and existing.kind='verification' then return existing.id;end if;
  raise exception 'Request ID already used';
 end if;
 if progress.verified then raise exception 'Already verified';end if;
 if progress.earned<50 or not progress.has_published then raise exception 'Earn 50 credits and publish an approved project before requesting verification';end if;
 if p_subject is null or length(trim(p_subject)) not between 3 and 120 or p_message is null or length(trim(p_message)) not between 10 and 4000 then raise exception 'Explain your identity and connection to your work';end if;
 if p_project is not null and not exists(select 1 from projects where slug=p_project and owner_user_id=p_user and listing_status='published') then raise exception 'Choose your published project';end if;
 insert into support_cases(id,user_id,kind,subject,message,project_slug)
 values(p_id,p_user,'verification',trim(p_subject),trim(p_message),p_project);
 return p_id;
end $$;
create function public.cw_notify_verification() returns trigger language plpgsql set search_path=public as $$
begin
 if new.verified and not old.verified then
  insert into notifications(user_id,kind,title,href) values(new.user_id,'verification','Your creator verification was approved. You’re now a Verified Creator.','/dashboard/verification');
 end if;
 return new;
end $$;
create trigger creator_verification_notification after update of verified on public.profiles for each row execute function public.cw_notify_verification();
revoke all on function public.cw_notify_verification() from public,anon,authenticated;
grant execute on function public.cw_notify_verification() to service_role;
revoke all on function public.cw_verification_progress(uuid),public.cw_request_verification(uuid,uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.cw_verification_progress(uuid),public.cw_request_verification(uuid,uuid,text,text,text) to service_role;
commit;
