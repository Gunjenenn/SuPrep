// Section E · decks & due cards.
import { getDb } from '@/lib/supabase/server';
import { DECKS } from '@/mocks/decks';
import type { CardState, Deck } from '@/types';

export async function listDecks(): Promise<Deck[]> {
  const db = await getDb();
  if (!db) return DECKS;
  const { data, error } = await db.from('decks').select('content').order('sort');
  if (error) throw error;
  return (data ?? []).map((r) => r.content as Deck);
}

export async function getDeck(id: string): Promise<Deck | null> {
  return (await listDecks()).find((d) => d.id === id) ?? null;
}

/** Card ids due now or earlier, with their Leitner state. */
export async function listDueCards(
  userId: string,
  now = Date.now(),
): Promise<(CardState & { cardId: string })[]> {
  const db = await getDb();
  if (!db) return [];
  const { data, error } = await db
    .from('card_states')
    .select('card_id, box, due_at, seen, ok')
    .eq('user_id', userId)
    .lte('due_at', new Date(now).toISOString());
  if (error) throw error;
  return (data ?? []).map((r) => ({
    cardId: r.card_id,
    box: r.box,
    due: Date.parse(r.due_at),
    seen: r.seen,
    ok: r.ok,
  }));
}
