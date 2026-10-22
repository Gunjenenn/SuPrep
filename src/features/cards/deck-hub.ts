import type { Card, CardState, Deck, DeckKind } from '@/types';
import { statusOf as boxStatus, type CardStatus } from './lib/leitner';

export type { CardStatus };

export type DueCard = { deckId: string; card: Card; state: CardState | null };

export type DeckSummary = {
  id: string;
  kind: DeckKind;
  title: string;
  sub: string;
  color: string;
  edge: string;
  total: number;
  due: number;
  progress: number;
  learning: number;
  mastered: number;
  disabled: boolean;
};

export type StatusCounts = Record<CardStatus, number>;

export const KINDS: DeckKind[] = ['word', 'formula', 'mine'];

const zero = (): StatusCounts => ({ new: 0, learning: 0, mastered: 0 });

export function statusOf(state: CardState | null): CardStatus {
  return state ? boxStatus(state.box) : 'new';
}

export function isDue(state: CardState | null, now: number): boolean {
  return !state || state.due <= now;
}

export function dueCards(decks: Deck[], states: Record<string, CardState>, now: number): DueCard[] {
  return decks.flatMap((d) =>
    d.cards
      .map((card) => ({ deckId: d.id, card, state: states[card.id] ?? null }))
      .filter((c) => isDue(c.state, now)),
  );
}

export function summarizeDecks(
  decks: Deck[],
  due: DueCard[],
  states: Record<string, CardState> = {},
): DeckSummary[] {
  const perDeck = new Map<string, number>();
  for (const c of due) perDeck.set(c.deckId, (perDeck.get(c.deckId) ?? 0) + 1);
  return decks.map((d) => {
    const total = d.cards.length;
    const n = Math.min(perDeck.get(d.id) ?? 0, total);
    const counts = zero();
    for (const c of d.cards) counts[statusOf(states[c.id] ?? null)] += 1;
    return {
      id: d.id,
      kind: d.kind,
      title: d.title,
      sub: d.sub,
      color: d.color,
      edge: d.edge,
      total,
      due: n,
      progress: total ? (total - n) / total : 0,
      learning: counts.learning,
      mastered: counts.mastered,
      disabled: n === 0,
    };
  });
}

export function countByStatus(due: DueCard[]): StatusCounts {
  const counts = zero();
  for (const c of due) counts[statusOf(c.state)] += 1;
  return counts;
}

export function countsByKind(
  decks: Deck[],
  states: Record<string, CardState>,
): Record<DeckKind, StatusCounts> {
  const out: Record<DeckKind, StatusCounts> = { word: zero(), formula: zero(), mine: zero() };
  for (const d of decks) for (const c of d.cards) out[d.kind][statusOf(states[c.id] ?? null)] += 1;
  return out;
}

export function dueByKind(summaries: DeckSummary[]): Record<DeckKind, number> {
  const out: Record<DeckKind, number> = { word: 0, formula: 0, mine: 0 };
  for (const s of summaries) out[s.kind] += s.due;
  return out;
}

export function byKind(summaries: DeckSummary[], kind: DeckKind): DeckSummary[] {
  return summaries.filter((s) => s.kind === kind);
}
