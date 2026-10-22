import { describe, expect, test } from 'bun:test';
import { answer, createSession, current, isDone, progress, tally } from './session-queue';

describe('session queue', () => {
  test('a known card leaves the queue', () => {
    const s = answer(createSession(['a', 'b']), true);
    expect(s.queue).toEqual(['b']);
    expect(current(s)).toBe('b');
  });

  test('a forgotten card comes back once at the end', () => {
    let s = answer(createSession(['a', 'b', 'c']), false);
    expect(s.queue).toEqual(['b', 'c', 'a']);
    s = answer(answer(s, true), true);
    expect(current(s)).toBe('a');
    s = answer(s, false);
    expect(s.queue).toEqual([]);
    expect(isDone(s)).toBe(true);
  });

  test('re-queue happens only once per card', () => {
    let s = createSession(['a']);
    s = answer(s, false);
    s = answer(s, false);
    expect(s.requeued).toEqual(['a']);
    expect(isDone(s)).toBe(true);
  });

  test('tally counts first-try knowns and forgotten cards', () => {
    let s = createSession(['a', 'b', 'c']);
    s = answer(s, true);
    s = answer(s, false);
    s = answer(s, true);
    s = answer(s, true);
    expect(tally(s)).toEqual({ knew: 2, again: 1 });
  });

  test('progress grows with re-queued cards', () => {
    let s = createSession(['a', 'b']);
    expect(progress(s)).toEqual({ done: 0, total: 2 });
    s = answer(s, false);
    expect(progress(s)).toEqual({ done: 1, total: 3 });
  });

  test('duplicate ids are ignored', () => {
    expect(createSession(['a', 'a', 'b']).queue).toEqual(['a', 'b']);
  });
});
