import { describe, expect, test } from 'bun:test';
import { DECKS } from '@/mocks/decks';
import { formulaCard, wordCard } from '@/test/fixtures';
import { buildQuiz, isCorrect, QUIZ_SIZE, shuffle } from './quiz';

const pool = DECKS.flatMap((d) => d.cards);

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

describe('buildQuiz', () => {
  test('every deck gets 5 questions with the answer in its options exactly once', () => {
    for (const deck of DECKS) {
      for (let seed = 1; seed <= 20; seed++) {
        const quiz = buildQuiz(deck.cards, pool, seeded(seed));
        expect(quiz).toHaveLength(Math.min(QUIZ_SIZE, deck.cards.length));
        expect(new Set(quiz.map((q) => q.cardId)).size).toBe(quiz.length);
        for (const q of quiz) {
          if (q.kind === 'type') {
            expect(q.options).toEqual([]);
            continue;
          }
          expect(q.options.filter((o) => o === q.answer)).toHaveLength(1);
          expect(new Set(q.options).size).toBe(q.options.length);
          expect(q.options).toHaveLength(4);
        }
      }
    }
  });

  test('formula decks ask to pick one of 4 TeX formulas', () => {
    const formulas = DECKS.filter((d) => d.kind === 'formula');
    for (const d of formulas) {
      const quiz = buildQuiz(d.cards, pool, seeded(7));
      expect(quiz.every((q) => q.kind === 'tex')).toBe(true);
    }
  });

  test('word decks mix choice, typing and listening', () => {
    const quiz = buildQuiz(DECKS[0].cards, pool, seeded(3));
    expect(new Set(quiz.map((q) => q.kind))).toEqual(new Set(['choice', 'type', 'listen']));
  });

  test('a tiny deck still gets distinct options from the pool', () => {
    const [q] = buildQuiz([wordCard], [wordCard, formulaCard, ...pool], seeded(1));
    expect(q.options.filter((o) => o === q.answer)).toHaveLength(1);
    expect(new Set(q.options).size).toBe(q.options.length);
  });
});

test('typed answers ignore case and spaces', () => {
  const typed = {
    id: 'x',
    kind: 'type' as const,
    cardId: 'sum',
    prompt: '',
    options: [],
    answer: 'at least',
  };
  expect(isCorrect(typed, '  At   LEAST ')).toBe(true);
  expect(isCorrect(typed, 'at most')).toBe(false);
});

test('shuffle keeps every item', () => {
  expect(shuffle([1, 2, 3, 4], seeded(5)).sort()).toEqual([1, 2, 3, 4]);
});

test('word questions never borrow distractors from formula cards', () => {
  const formulaValues = new Set(
    DECKS.filter((d) => d.kind === 'formula').flatMap((d) => d.cards.flatMap((c) => [c.front, c.back])),
  );
  for (const deck of DECKS.filter((d) => d.kind === 'word')) {
    for (let seed = 1; seed <= 20; seed++) {
      for (const q of buildQuiz(deck.cards, pool, seeded(seed))) {
        for (const o of q.options) expect(formulaValues.has(o)).toBe(false);
      }
    }
  }
});
