-- G хэсэг · Суугийн хариунд өгсөн санал (👍/👎 + илүү сайн тайлбар).
-- Энэ өгөгдөл ШУУД сургалтад орохгүй: ai/pipeline/feedback.ts автомат шалгалт хийж,
-- хүн (багш/баг) status = 'approved' болгосон мөрүүд л fine-tune өгөгдөлд орно.

create table if not exists tutor_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  mode text not null check (mode in ('hint', 'explain', 'desmos', 'similar', 'translate')),
  context_kind text check (context_kind in ('lesson', 'desmos', 'question', 'mistake', 'general')),
  context_id text,
  prompt text not null check (char_length(prompt) between 1 and 2000),
  reply text not null check (char_length(reply) between 1 and 4000),
  rating text not null check (rating in ('up', 'down')),
  correction text check (char_length(correction) <= 2000),
  model text not null default 'suu',
  status text not null default 'new' check (status in ('new', 'approved', 'rejected')),
  review_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists tutor_feedback_status on tutor_feedback (status, created_at);

alter table tutor_feedback enable row level security;

-- Сурагч зөвхөн өөрийн нэрээр, 'new' төлөвтэй мөр нэмнэ. Унших, засах, батлах нь service role (баг) л.
create policy "insert own feedback" on tutor_feedback for insert
  with check (auth.uid() = user_id and status = 'new' and reviewed_at is null);
create policy "read own feedback" on tutor_feedback for select using (auth.uid() = user_id);
