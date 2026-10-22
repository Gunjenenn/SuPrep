import { describe, expect, test } from 'bun:test';
import { NOW } from '@/test/fixtures';
import type { CardState } from '@/types';
import { freshState, grade, reviewDay, statusOf } from './leitner';

const DAY = 86_400_000;

describe('grade', () => {
  test('five correct answers in a row stay capped at box 4', () => {
    let s: CardState = freshState(NOW);
    const boxes: number[] = [];
    for (let i = 0; i < 5; i++) {
      s = grade(s, true, NOW);
      boxes.push(s.box);
    }
    expect(boxes).toEqual([1, 2, 3, 4, 4]);
    expect(s.seen).toBe(5);
    expect(s.ok).toBe(5);
  });

  test('a forgotten card goes back to box 1, due now', () => {
    const s = grade({ box: 4, due: NOW - 30 * DAY, seen: 6, ok: 6 }, false, NOW);
    expect(s).toEqual({ box: 1, due: NOW, seen: 7, ok: 6 });
  });

  test('known cards wait 1 · 3 · 7 · 14 days', () => {
    const due = [0, 1, 2, 3].map((box) => grade({ box, due: NOW, seen: 0, ok: 0 }, true, NOW).due - NOW);
    expect(due).toEqual([1 * DAY, 3 * DAY, 7 * DAY, 14 * DAY]);
  });
});

test('statusOf maps boxes to шинэ · сурч буй · цээжилсэн', () => {
  expect([0, 1, 2, 3, 4].map(statusOf)).toEqual(['new', 'new', 'learning', 'mastered', 'mastered']);
});

test('reviewDay uses Ulaanbaatar days', () => {
  expect(reviewDay(NOW, NOW)).toBe('today');
  expect(reviewDay(NOW + DAY, NOW)).toBe('tomorrow');
  expect(reviewDay(NOW + 3 * DAY, NOW)).toBe('later');
  expect(reviewDay(NOW - DAY, NOW)).toBe('today');
});
