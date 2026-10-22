import { describe, expect, test } from 'bun:test';
import { deck, formulaCard, NOW, wordCard } from '@/test/fixtures';
import type { CardState, Deck } from '@/types';
import {
  byKind,
  countByStatus,
  countsByKind,
  dueByKind,
  dueCards,
  statusOf,
  summarizeDecks,
} from './deck-hub';

const DAY = 86_400_000;
const wordDeck: Deck = { ...deck, cards: [wordCard, { ...wordCard, id: 'product' }] };
const formulaDeck: Deck = { ...deck, id: 'f-alg', kind: 'formula', cards: [formulaCard] };
const emptyDeck: Deck = { ...deck, id: 'mine', kind: 'mine', cards: [] };
const decks = [wordDeck, formulaDeck, emptyDeck];

const state = (box: number, due: number): CardState => ({ box, due, seen: 1, ok: 1 });

describe('dueCards', () => {
  test('unseen cards are due', () => {
    const due = dueCards(decks, {}, NOW);
    expect(due.map((c) => c.card.id)).toEqual(['sum', 'product', 'slope']);
    expect(due.every((c) => c.state === null)).toBe(true);
  });

  test('cards scheduled in the future are not due', () => {
    const due = dueCards(decks, { sum: state(2, NOW + DAY), slope: state(3, NOW) }, NOW);
    expect(due.map((c) => c.card.id)).toEqual(['product', 'slope']);
  });
});

describe('summarizeDecks', () => {
  test('counts due cards per deck', () => {
    const due = dueCards(decks, { sum: state(2, NOW + DAY) }, NOW);
    const [w, f, m] = summarizeDecks(decks, due);
    expect(w).toMatchObject({ id: 'ops', total: 2, due: 1, progress: 0.5, disabled: false });
    expect(f).toMatchObject({ id: 'f-alg', total: 1, due: 1, progress: 0, disabled: false });
    expect(m).toMatchObject({ id: 'mine', total: 0, due: 0, progress: 0 });
  });

  test('a deck with nothing due is disabled', () => {
    const due = dueCards(decks, { sum: state(4, NOW + DAY), product: state(3, NOW + DAY) }, NOW);
    const [w] = summarizeDecks(decks, due);
    expect(w.due).toBe(0);
    expect(w.progress).toBe(1);
    expect(w.disabled).toBe(true);
  });

  test('an empty deck is disabled', () => {
    const [, , m] = summarizeDecks(decks, dueCards(decks, {}, NOW));
    expect(m.disabled).toBe(true);
  });

  test('due count never exceeds the deck size', () => {
    const extra = dueCards([formulaDeck, formulaDeck], {}, NOW);
    const [f] = summarizeDecks([formulaDeck], extra);
    expect(f.due).toBe(1);
  });
});

describe('status counters', () => {
  test('statusOf maps Leitner boxes', () => {
    expect(statusOf(null)).toBe('new');
    expect(statusOf(state(1, NOW))).toBe('new');
    expect(statusOf(state(2, NOW))).toBe('learning');
    expect(statusOf(state(3, NOW))).toBe('mastered');
    expect(statusOf(state(4, NOW))).toBe('mastered');
  });

  test('countByStatus groups the due cards', () => {
    const due = dueCards(decks, { product: state(2, NOW), slope: state(4, NOW - DAY) }, NOW);
    expect(countByStatus(due)).toEqual({ new: 1, learning: 1, mastered: 1 });
  });

  test('byKind filters summaries for each tab', () => {
    const summaries = summarizeDecks(decks, []);
    expect(byKind(summaries, 'word').map((s) => s.id)).toEqual(['ops']);
    expect(byKind(summaries, 'formula').map((s) => s.id)).toEqual(['f-alg']);
    expect(byKind(summaries, 'mine').map((s) => s.id)).toEqual(['mine']);
  });
});

describe('hub panels', () => {
  const states = { sum: state(2, NOW + DAY), product: state(4, NOW + DAY), slope: state(3, NOW) };

  test('deck summaries count learning and mastered cards for the progress bar', () => {
    const [w, f] = summarizeDecks(decks, dueCards(decks, states, NOW), states);
    expect(w).toMatchObject({ learning: 1, mastered: 1, due: 0, disabled: true });
    expect(f).toMatchObject({ learning: 0, mastered: 1, due: 1, disabled: false });
  });

  test('countsByKind covers every card of each tab, not only due ones', () => {
    expect(countsByKind(decks, states)).toEqual({
      word: { new: 0, learning: 1, mastered: 1 },
      formula: { new: 0, learning: 0, mastered: 1 },
      mine: { new: 0, learning: 0, mastered: 0 },
    });
  });

  test('dueByKind sums due cards per tab', () => {
    const summaries = summarizeDecks(decks, dueCards(decks, {}, NOW));
    expect(dueByKind(summaries)).toEqual({ word: 2, formula: 1, mine: 0 });
  });
});
