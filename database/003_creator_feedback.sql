-- CreatorWorks only. Existing comments and their visibility remain unchanged.
begin;
create table if not exists public.creator_feedback (
 id uuid primary key default gen_random_uuid(), project_slug text not null references public.projects(slug), author_user_id uuid not null references public.users(id),
 helpful text not null check(helpful in ('yes','somewhat','not_yet','not_tried')),
 price text not null check(price in ('worth_it','too_expensive','unsure','free')),
 message text not null default '' check(length(message)<=800), visibility text not null check(visibility in ('public','private')),
 moderation_status text not null default 'pending' check(moderation_status in ('pending','published','hidden')),
 created_at timestamptz not null default now(), unique(project_slug,author_user_id)
);
create table if not exists public.feedback_replies (
 id uuid primary key default gen_random_uuid(), feedback_id uuid not null references public.creator_feedback(id), author_user_id uuid not null references public.users(id),
 message text not null check(length(trim(message)) between 1 and 800), request_id uuid not null unique, created_at timestamptz not null default now()
);
create index if not exists feedback_project_date on public.creator_feedback(project_slug,created_at desc);
create index if not exists feedback_author_date on public.creator_feedback(author_user_id,created_at desc);
create index if not exists replies_thread_date on public.feedback_replies(feedback_id,created_at);
create table if not exists public.feedback_review_history (
 id uuid primary key default gen_random_uuid(), actor_user_id uuid not null references public.users(id), feedback_id uuid not null references public.creator_feedback(id),
 previous_status text not null,new_status text not null,reason text not null check(length(trim(reason)) between 3 and 300),created_at timestamptz not null default now()
);
alter table public.creator_feedback enable row level security;
alter table public.feedback_replies enable row level security;
alter table public.feedback_review_history enable row level security;
revoke all on public.creator_feedback,public.feedback_replies,public.feedback_review_history from anon,authenticated;
grant select,insert on public.creator_feedback,public.feedback_replies,public.feedback_review_history to service_role;
grant update(moderation_status) on public.creator_feedback to service_role;
create or replace function public.cw_review_feedback(p_actor uuid,p_id uuid,p_previous text,p_status text,p_reason text)
returns void language plpgsql security invoker set search_path=public as $$
declare item public.creator_feedback%rowtype;
begin
 if p_status is null or p_status not in ('published','hidden','pending') or p_reason is null or length(trim(p_reason)) not between 3 and 300 then raise exception 'Invalid decision'; end if;
 select * into item from public.creator_feedback where id=p_id for update;
 if not found or item.moderation_status is distinct from p_previous then raise exception 'Reload feedback'; end if;
 if item.visibility <> 'public' then raise exception 'Private feedback cannot be published'; end if;
 update public.creator_feedback set moderation_status=p_status where id=p_id;
 insert into public.feedback_review_history(actor_user_id,feedback_id,previous_status,new_status,reason) values(p_actor,p_id,item.moderation_status,p_status,trim(p_reason));
end; $$;
revoke all on function public.cw_review_feedback(uuid,uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.cw_review_feedback(uuid,uuid,text,text,text) to service_role;
create or replace function public.cw_feedback_reply(p_actor uuid,p_id uuid,p_message text,p_request uuid)
returns void language plpgsql security invoker set search_path=public as $$
declare item public.creator_feedback%rowtype; owner_id uuid;
begin
 if p_message is null or length(trim(p_message)) not between 1 and 800 or p_request is null then raise exception 'Invalid reply'; end if;
 select * into item from public.creator_feedback where id=p_id for update;
 if not found then raise exception 'Not found'; end if;
 select owner_user_id into owner_id from public.projects where slug=item.project_slug for share;
 if p_actor is null or (p_actor is distinct from item.author_user_id and p_actor is distinct from owner_id) then raise exception 'Not allowed'; end if;
 if exists(select 1 from public.feedback_replies where request_id=p_request and author_user_id=p_actor and feedback_id=p_id) then return; end if;
 if exists(select 1 from public.feedback_replies where feedback_id=p_id and author_user_id=p_actor and created_at>now()-interval '10 seconds') then raise exception 'Please wait before replying again'; end if;
 insert into public.feedback_replies(feedback_id,author_user_id,message,request_id) values(p_id,p_actor,trim(p_message),p_request);
end; $$;
revoke all on function public.cw_feedback_reply(uuid,uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.cw_feedback_reply(uuid,uuid,text,uuid) to service_role;
commit;
