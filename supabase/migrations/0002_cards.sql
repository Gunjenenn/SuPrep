-- E хэсэг · карт: багц, карт, Leitner төлөв, санах түлхүүрийн тэмдэглэл, миний багц.
-- Агуулга одоогоор content/cards/*.json-оос уншигдана; decks, cards хүснэгтийг seed хийхэд бэлэн.

create table if not exists decks (
  id text primary key,
  kind text not null check (kind in ('word', 'formula')),
  title text not null,
  sub text not null default '',
  color text not null,
  edge text not null,
  position int not null default 0
);

create table if not exists cards (
  id text primary key,
  deck_id text not null references decks on delete cascade,
  front text not null,
  ipa text,
  say text,
  back text not null,
  hook text,
  ex text,
  tex text,
  "when" text,
  art text not null,
  v text,
  position int not null default 0
);

create table if not exists card_states (
  user_id uuid not null references auth.users on delete cascade,
  card_id text not null,
  box int not null default 0 check (box between 0 and 4),
  due_at timestamptz not null default now(),
  seen int not null default 0,
  ok int not null default 0,
  primary key (user_id, card_id)
);

create index if not exists card_states_due on card_states (user_id, due_at);

create table if not exists card_notes (
  user_id uuid not null references auth.users on delete cascade,
  card_id text not null,
  text text not null check (char_length(text) <= 300),
  updated_at timestamptz not null default now(),
  primary key (user_id, card_id)
);

create table if not exists my_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  front text not null check (char_length(front) between 1 and 60),
  back text not null check (char_length(back) between 1 and 80),
  hook text check (char_length(hook) <= 200),
  ex text check (char_length(ex) <= 160),
  created_at timestamptz not null default now()
);

create index if not exists my_cards_user on my_cards (user_id, created_at);

alter table decks enable row level security;
alter table cards enable row level security;
alter table card_states enable row level security;
alter table card_notes enable row level security;
alter table my_cards enable row level security;

create policy "decks are public" on decks for select using (true);
create policy "cards are public" on cards for select using (true);
create policy "own card states" on card_states for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own card notes" on card_notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own cards" on my_cards for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
