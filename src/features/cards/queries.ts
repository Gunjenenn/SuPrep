import { getDb } from '@/lib/supabase/server';
import { DECKS } from '@/mocks/decks';
import type { CardState, Deck } from '@/types';
import { type DueCard, dueCards } from './deck-hub';

export const DEMO_USER_ID = 'u-demo';

type StateRow = { card_id: string; box: number; due: string; seen: number; ok: number };

export async function getUserId(): Promise<string> {
  const db = await getDb();
  if (!db) return DEMO_USER_ID;
  const { data } = await db.auth.getUser();
  return data.user?.id ?? DEMO_USER_ID;
}

export async function listDecks(): Promise<Deck[]> {
  return DECKS;
}

export async function listCardStates(userId: string): Promise<Record<string, CardState>> {
  const db = await getDb();
  if (!db) return {};
  const { data, error } = await db
    .from('card_states')
    .select('card_id, box, due, seen, ok')
    .eq('user_id', userId);
  if (error || !data) return {};
  return Object.fromEntries(
    (data as StateRow[]).map((r) => [
      r.card_id,
      { box: r.box, due: new Date(r.due).getTime(), seen: r.seen, ok: r.ok },
    ]),
  );
}

export async function listDueCards(userId: string, now: number = Date.now()): Promise<DueCard[]> {
  const [decks, states] = await Promise.all([listDecks(), listCardStates(userId)]);
  return dueCards(decks, states, now);
}
