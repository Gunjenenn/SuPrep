import { describe, expect, test } from 'bun:test';
import { type CardState, grade, statusOf } from './leitner';

describe('grade', () => {
  test('five consecutive correct answers cap at box 4', () => {
    const now = new Date('2026-10-22T00:00:00Z');
    let state: CardState = { box: 0, due_at: now };

    state = grade(state, true, now);
    expect(state.box).toBe(1);

    state = grade(state, true, now);
    expect(state.box).toBe(2);

    state = grade(state, true, now);
    expect(state.box).toBe(3);

    state = grade(state, true, now);
    expect(state.box).toBe(4);

    state = grade(state, true, now);
    expect(state.box).toBe(4);
  });

  test('incorrect answer resets box to 1 and due_at to now', () => {
    const now = new Date('2026-10-22T00:00:00Z');
    const state: CardState = { box: 4, due_at: new Date('2026-10-01T00:00:00Z') };

    const result = grade(state, false, now);
    expect(result.box).toBe(1);
    expect(result.due_at).toEqual(now);
  });

  test('correct answer sets due_at by box interval', () => {
    const now = new Date('2026-10-22T00:00:00Z');
    const DAY_MS = 86_400_000;

    const box1 = grade({ box: 0, due_at: now }, true, now);
    expect(box1.due_at.getTime()).toBe(now.getTime() + 1 * DAY_MS);

    const box2 = grade({ box: 1, due_at: now }, true, now);
    expect(box2.due_at.getTime()).toBe(now.getTime() + 3 * DAY_MS);

    const box3 = grade({ box: 2, due_at: now }, true, now);
    expect(box3.due_at.getTime()).toBe(now.getTime() + 7 * DAY_MS);

    const box4 = grade({ box: 3, due_at: now }, true, now);
    expect(box4.due_at.getTime()).toBe(now.getTime() + 14 * DAY_MS);
  });
});

describe('statusOf', () => {
  test('returns correct status for each box', () => {
    expect(statusOf(1)).toBe('шинэ');
    expect(statusOf(2)).toBe('сурч буй');
    expect(statusOf(3)).toBe('цээжилсэн');
    expect(statusOf(4)).toBe('цээжилсэн');
  });

  test('box <= 1 returns шинэ', () => {
    expect(statusOf(0)).toBe('шинэ');
    expect(statusOf(1)).toBe('шинэ');
  });
});
