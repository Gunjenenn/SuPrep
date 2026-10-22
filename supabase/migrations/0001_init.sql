-- Supabase-ийн хүснэгтүүд SQL-ээр тодорхойлогддог (энэ нь апп-ын код биш, DB-ийн схем).
-- Эхний хувилбар: хэсэг бүр өөрийн хүснэгтээ шинэ migration файлаар нэмнэ (0002_cards.sql гэх мэт).
-- Ажиллуулах: Supabase dashboard → SQL editor, эсвэл `bunx supabase db push`.

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default '',
  onboarded boolean not null default false,
  confidence int,
  sat_exp text,
  desmos text,
  target int not null default 650,
  exam_date date,
  start text,
  created_at timestamptz not null default now()
);

create table if not exists questions (
  id text primary key,
  domain text not null check (domain in ('alg','adv','psda','geo')),
  difficulty int not null check (difficulty between 1 and 3),
  content jsonb not null
);

create table if not exists xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  amount int not null,
  reason text not null,
  key text not null,
  at timestamptz not null default now(),
  unique (user_id, key)
);

alter table profiles enable row level security;
alter table questions enable row level security;
alter table xp_events enable row level security;

create policy "own profile" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "questions are public" on questions for select using (true);
create policy "own xp" on xp_events for select using (auth.uid() = user_id);
