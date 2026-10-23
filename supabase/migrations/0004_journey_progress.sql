
-- Хэрэглэгч бүрийн хичээл болон checkpoint-ийн progress

create table if not exists lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  done boolean not null default false,
  best integer not null default 0 check (best >= 0),
  updated_at timestamptz not null default now(),

  primary key (user_id, lesson_id)
);

-- Хэрэглэгч зөвхөн өөрийн progress-д хандах эрхтэй.

alter table lesson_progress enable row level security;

create policy "Users can read own lesson progress"
on lesson_progress
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own lesson progress"
on lesson_progress
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own lesson progress"
on lesson_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function preserve_journey_progress()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.done := old.done or new.done;
  new.best := greatest(old.best, new.best);
  new.updated_at := now();

  return new;
end;
$$;

create trigger preserve_journey_progress_trigger
before update on lesson_progress
for each row
execute function preserve_journey_progress();
