-- Apply only to the separate CreatorWorks database.
begin;
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  workos_user_id text not null unique,
  system_role text not null default 'member' check (system_role in ('member', 'admin')),
  created_at timestamptz not null default now()
);
create table if not exists public.profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  slug text not null unique,
  display_name text not null check (length(display_name) between 1 and 60),
  identity_label text not null default '' check (length(identity_label) <= 60),
  bio text not null default '' check (length(bio) <= 500),
  avatar_path text,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  owner_user_id uuid references public.users(id),
  title text not null,
  visibility text not null default 'draft' check (visibility in ('draft','private-link','public')),
  ownership_status text not null default 'unverified' check (ownership_status in ('unverified','review-pending','verified')),
  created_at timestamptz not null default now()
);
create table if not exists public.saved_projects (
  user_id uuid not null references public.users(id) on delete cascade,
  project_slug text not null references public.projects(slug) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, project_slug)
);
create table if not exists public.project_experiences (
  id uuid primary key default gen_random_uuid(),
  project_slug text not null references public.projects(slug) on delete cascade,
  author_user_id uuid not null references public.users(id) on delete cascade,
  response text not null check (length(response) between 1 and 800),
  moderation_status text not null default 'pending' check (moderation_status in ('pending','published','hidden')),
  created_at timestamptz not null default now(),
  unique (project_slug, author_user_id)
);
-- WorkOS identity is checked by the server. Browser database access is denied.
alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.saved_projects enable row level security;
alter table public.project_experiences enable row level security;
revoke all on public.users, public.profiles, public.projects, public.saved_projects, public.project_experiences from anon, authenticated;
grant all on public.users, public.profiles, public.projects, public.saved_projects, public.project_experiences to service_role;

insert into public.projects(slug,title,visibility) values
 ('afterschooltogether','AfterSchool Together','public'), ('stackscout','StackScout','public'),
 ('gamegrid','GameGrid','public'), ('lessonlab','LessonLab','public'), ('cartcompare','CartCompare','public'),
 ('pocketbalance','PocketBalance','public'), ('dayframe','DayFrame','public'), ('mealmap','MealMap','public'),
 ('homerhythm','HomeRhythm','public'), ('packlight','PackLight','public'), ('briefbuilder','BriefBuilder','public')
on conflict (slug) do nothing;
-- These are in-house catalog records; attach the real founder after their first sign-in.
-- Fictional demo personas must never be inserted into users or verified feedback.
commit;
