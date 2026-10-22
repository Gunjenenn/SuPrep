import type { Card, CardState, Deck, DeckKind } from '@/types';

export type CardStatus = 'new' | 'learning' | 'mastered';

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
  disabled: boolean;
};

export type StatusCounts = Record<CardStatus, number>;

export function statusOf(state: CardState | null): CardStatus {
  if (!state || state.box <= 1) return 'new';
  if (state.box === 2) return 'learning';
  return 'mastered';
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

export function summarizeDecks(decks: Deck[], due: DueCard[]): DeckSummary[] {
  const perDeck = new Map<string, number>();
  for (const c of due) perDeck.set(c.deckId, (perDeck.get(c.deckId) ?? 0) + 1);
  return decks.map((d) => {
    const total = d.cards.length;
    const n = Math.min(perDeck.get(d.id) ?? 0, total);
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
      disabled: n === 0,
    };
  });
}

export function countByStatus(due: DueCard[]): StatusCounts {
  const counts: StatusCounts = { new: 0, learning: 0, mastered: 0 };
  for (const c of due) counts[statusOf(c.state)] += 1;
  return counts;
}

export function byKind(summaries: DeckSummary[], kind: DeckKind): DeckSummary[] {
  return summaries.filter((s) => s.kind === kind);
}
