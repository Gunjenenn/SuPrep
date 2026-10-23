
-- Journey-ийн шат болон хичээлийн агуулга

create table if not exists public.stages (
  id text primary key,
  no integer not null unique check (no > 0),
  content jsonb not null
);

create table if not exists public.lessons (
  id text primary key,
  content jsonb not null
);

-- Агуулгыг бүх хэрэглэгч унших боломжтой.
-- Browser болон Server Action-ээс өөрчлөх эрх олгохгүй.

alter table public.stages enable row level security;
alter table public.lessons enable row level security;

create policy "Stages are publicly readable"
on public.stages
for select
to anon, authenticated
using (true);

create policy "Lessons are publicly readable"
on public.lessons
for select
to anon, authenticated
using (true);
