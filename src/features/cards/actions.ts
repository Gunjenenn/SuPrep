'use server';
import { revalidatePath } from 'next/cache';
import { routes } from '@/lib/routes';
import { getDb } from '@/lib/supabase/server';
import type { Card, CardState } from '@/types';
import { MyCardInput } from './lib/content';
import { demoUser } from './lib/demo-store';
import { freshState, grade } from './lib/leitner';
import { getUserId, toMyCard } from './queries';

const isId = (v: unknown): v is string => typeof v === 'string' && v.length > 0 && v.length <= 80;

export async function gradeCard(cardId: string, knew: boolean): Promise<CardState | null> {
  if (!isId(cardId) || typeof knew !== 'boolean') return null;
  const userId = await getUserId();
  const now = Date.now();
  const db = await getDb();
  if (!db) {
    const u = demoUser(userId);
    const next = grade(u.states[cardId] ?? freshState(now), knew, now);
    u.states[cardId] = next;
    revalidatePath(routes.cards);
    return next;
  }
  const { data } = await db
    .from('card_states')
    .select('box, due_at, seen, ok')
    .eq('user_id', userId)
    .eq('card_id', cardId)
    .maybeSingle();
  const prev: CardState = data
    ? { box: data.box, due: Date.parse(data.due_at), seen: data.seen, ok: data.ok }
    : freshState(now);
  const next = grade(prev, knew, now);
  const { error } = await db.from('card_states').upsert({
    user_id: userId,
    card_id: cardId,
    box: next.box,
    due_at: new Date(next.due).toISOString(),
    seen: next.seen,
    ok: next.ok,
  });
  if (error) return null;
  revalidatePath(routes.cards);
  return next;
}

export async function saveNote(cardId: string, text: string): Promise<boolean> {
  if (!isId(cardId) || typeof text !== 'string') return false;
  const note = text.trim().slice(0, 300);
  const userId = await getUserId();
  const db = await getDb();
  if (!db) {
    const u = demoUser(userId);
    if (note) u.notes[cardId] = note;
    else delete u.notes[cardId];
    return true;
  }
  const q = note
    ? db.from('card_notes').upsert({ user_id: userId, card_id: cardId, text: note })
    : db.from('card_notes').delete().eq('user_id', userId).eq('card_id', cardId);
  const { error } = await q;
  return !error;
}

export type AddCardResult = { ok: true; card: Card } | { ok: false; errors: Record<string, string> };

export async function addMyCard(input: unknown): Promise<AddCardResult> {
  const parsed = MyCardInput.safeParse(input);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { ok: false, errors };
  }
  const { front, back, hook, ex } = parsed.data;
  const userId = await getUserId();
  const db = await getDb();
  let card: Card;
  if (!db) {
    card = toMyCard({ id: crypto.randomUUID(), front, back, hook, ex });
    demoUser(userId).mine.push(card);
  } else {
    const { data, error } = await db
      .from('my_cards')
      .insert({ user_id: userId, front, back, hook, ex })
      .select('id, front, back, hook, ex')
      .single();
    if (error || !data) return { ok: false, errors: { form: 'save' } };
    card = toMyCard(data);
  }
  revalidatePath(routes.myCards);
  revalidatePath(routes.cards);
  return { ok: true, card };
}

export async function deleteMyCard(cardId: string): Promise<boolean> {
  if (!isId(cardId) || !cardId.startsWith('my-')) return false;
  const userId = await getUserId();
  const db = await getDb();
  if (!db) {
    const u = demoUser(userId);
    u.mine = u.mine.filter((c) => c.id !== cardId);
    delete u.states[cardId];
    delete u.notes[cardId];
  } else {
    const { error } = await db.from('my_cards').delete().eq('user_id', userId).eq('id', cardId.slice(3));
    if (error) return false;
  }
  revalidatePath(routes.myCards);
  revalidatePath(routes.cards);
  return true;
}
