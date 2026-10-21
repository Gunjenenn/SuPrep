-- SuuPrep database schema
-- Supabase → SQL Editor дээр энэ файлыг бүтнээр нь хуулж ажиллуулна.
-- Дараа нь supabase/seed.sql-ийг ажиллуулж асуултуудаа нэмнэ.

create extension if not exists pgcrypto;

-- ───────────────────────── profiles ─────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  target_score int check (target_score between 200 and 800),
  test_date date,
  hours_per_week int,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

drop policy if exists "profiles: own select" on public.profiles;
drop policy if exists "profiles: own insert" on public.profiles;
drop policy if exists "profiles: own update" on public.profiles;
create policy "profiles: own select" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profiles: own insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles: own update" on public.profiles for update to authenticated using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ───────────────────────── questions ─────────────────────────
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  domain text not null check (domain in ('algebra', 'advanced_math', 'problem_solving', 'geometry_trig')),
  skill text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  type text not null check (type in ('mcq', 'spr')),
  prompt text not null,
  choices jsonb,
  answer text not null,        -- mcq: 'A'..'D'; spr: зөв хариултууд '|'-ээр тусгаарлагдана, ж: '3/4|0.75'
  explanation text not null,
  created_at timestamptz not null default now()
);
alter table public.questions enable row level security;

drop policy if exists "questions: readable" on public.questions;
create policy "questions: readable" on public.questions for select to authenticated using (true);

-- Хариулт, тайлбарыг хөтөчөөс шууд унших боломжгүй болгоно.
-- Тэдгээрийг зөвхөн submit_answer / get_question_context функцээр авна.
revoke all on public.questions from anon, authenticated;
grant select (id, slug, domain, skill, difficulty, type, prompt, choices, created_at)
  on public.questions to authenticated;

-- ───────────────────────── attempts ─────────────────────────
create table if not exists public.attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  selected text,
  is_correct boolean not null,
  time_spent_sec int not null default 0,
  source text not null default 'practice' check (source in ('practice', 'test')),
  created_at timestamptz not null default now()
);
create index if not exists attempts_user_idx on public.attempts (user_id, created_at desc);
alter table public.attempts enable row level security;

drop policy if exists "attempts: own select" on public.attempts;
create policy "attempts: own select" on public.attempts for select to authenticated using (auth.uid() = user_id);
-- Insert зөвхөн submit_answer() функцээр (зөв/бурууг сервер шийднэ).

-- ───────────────────────── test sessions ─────────────────────────
create table if not exists public.test_sessions (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  total int not null,
  correct int not null,
  duration_sec int not null,
  created_at timestamptz not null default now()
);
alter table public.test_sessions enable row level security;
drop policy if exists "tests: own select" on public.test_sessions;
drop policy if exists "tests: own insert" on public.test_sessions;
create policy "tests: own select" on public.test_sessions for select to authenticated using (auth.uid() = user_id);
create policy "tests: own insert" on public.test_sessions for insert to authenticated with check (auth.uid() = user_id);

-- ───────────────────────── study plans ─────────────────────────
create table if not exists public.study_plans (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  plan jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.study_plans enable row level security;
drop policy if exists "plans: own select" on public.study_plans;
drop policy if exists "plans: own insert" on public.study_plans;
create policy "plans: own select" on public.study_plans for select to authenticated using (auth.uid() = user_id);
create policy "plans: own insert" on public.study_plans for insert to authenticated with check (auth.uid() = user_id);

-- ───────────────────────── AI usage (өдрийн хязгаар) ─────────────────────────
create table if not exists public.ai_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  feature text not null check (feature in ('tutor', 'planner', 'analysis')),
  created_at timestamptz not null default now()
);
create index if not exists ai_usage_user_idx on public.ai_usage (user_id, feature, created_at desc);
alter table public.ai_usage enable row level security;
drop policy if exists "usage: own select" on public.ai_usage;
drop policy if exists "usage: own insert" on public.ai_usage;
create policy "usage: own select" on public.ai_usage for select to authenticated using (auth.uid() = user_id);
create policy "usage: own insert" on public.ai_usage for insert to authenticated with check (auth.uid() = user_id);

-- ───────────────────────── functions ─────────────────────────
create or replace function public.parse_num(t text)
returns numeric language plpgsql immutable as $$
declare s text := replace(coalesce(trim(t), ''), ' ', '');
begin
  if s ~ '^-?\d+(\.\d+)?$' or s ~ '^-?\.\d+$' then
    return s::numeric;
  elsif s ~ '^-?\d+/\d+$' and split_part(s, '/', 2)::numeric <> 0 then
    return split_part(s, '/', 1)::numeric / split_part(s, '/', 2)::numeric;
  end if;
  return null;
end;
$$;

-- Хариултыг шалгаад attempts-д бичнэ. Зөв хариулт ба тайлбарыг буцаана.
create or replace function public.submit_answer(
  p_question_id uuid,
  p_selected text,
  p_time_spent int default 0,
  p_source text default 'practice'
)
returns table (is_correct boolean, correct_answer text, explanation text)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare
  q public.questions%rowtype;
  ok boolean := false;
  alt text;
  sel_num numeric;
  alt_num numeric;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select * into q from public.questions where id = p_question_id;
  if not found then
    raise exception 'question not found';
  end if;

  if q.type = 'mcq' then
    ok := upper(trim(coalesce(p_selected, ''))) = upper(q.answer);
  else
    sel_num := public.parse_num(p_selected);
    foreach alt in array string_to_array(q.answer, '|') loop
      if lower(replace(trim(coalesce(p_selected, '')), ' ', '')) = lower(replace(trim(alt), ' ', '')) then
        ok := true;
      end if;
      alt_num := public.parse_num(alt);
      if sel_num is not null and alt_num is not null and abs(sel_num - alt_num) < 0.0005 then
        ok := true;
      end if;
    end loop;
  end if;

  insert into public.attempts (user_id, question_id, selected, is_correct, time_spent_sec, source)
  values (auth.uid(), q.id, p_selected, ok, greatest(coalesce(p_time_spent, 0), 0),
          case when p_source = 'test' then 'test' else 'practice' end);

  return query select ok, split_part(q.answer, '|', 1), q.explanation;
end;
$$;

-- AI багшид өгөх асуултын мэдээлэл. Сурагч хариулж үзээгүй бол хариулт/тайлбарыг нуух.
create or replace function public.get_question_context(p_question_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  q public.questions%rowtype;
  attempted boolean;
begin
  if auth.uid() is null then
    return null;
  end if;
  select * into q from public.questions where id = p_question_id;
  if not found then
    return null;
  end if;
  select exists (
    select 1 from public.attempts a where a.user_id = auth.uid() and a.question_id = q.id
  ) into attempted;

  return jsonb_build_object(
    'prompt', q.prompt,
    'choices', q.choices,
    'type', q.type,
    'domain', q.domain,
    'skill', q.skill,
    'difficulty', q.difficulty,
    'attempted', attempted,
    'answer', case when attempted then q.answer end,
    'explanation', case when attempted then q.explanation end
  );
end;
$$;

revoke all on function public.submit_answer(uuid, text, int, text) from public, anon;
revoke all on function public.get_question_context(uuid) from public, anon;
grant execute on function public.submit_answer(uuid, text, int, text) to authenticated;
grant execute on function public.get_question_context(uuid) to authenticated;
