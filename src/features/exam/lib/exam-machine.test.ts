import { expect, test } from 'bun:test';
import { createInitialExamState, getRemainingSeconds, transitionExam } from './exam-machine';

const NOW = Date.parse('2026-10-22T10:00:00.000Z');

test('initial phase is intro', () => {
  expect(createInitialExamState()).toEqual({
    phase: 'intro',
    endsAt: null,
  });
});

test('START begins module 1 with 35 minutes', () => {
  const state = transitionExam(createInitialExamState(), 'START', NOW);

  expect(state.phase).toBe('module1');
  expect(getRemainingSeconds(state.endsAt, NOW)).toBe(2100);
});

test('module 1 submission starts 10 minute break', () => {
  const started = transitionExam(createInitialExamState(), 'START', NOW);
  const next = transitionExam(started, 'SUBMIT', NOW + 60_000);

  expect(next.phase).toBe('break');
  expect(getRemainingSeconds(next.endsAt, NOW + 60_000)).toBe(600);
});

test('break timeout begins module 2', () => {
  const state = {
    phase: 'break' as const,
    endsAt: new Date(NOW).toISOString(),
  };

  const next = transitionExam(state, 'TIME_UP', NOW);

  expect(next.phase).toBe('module2');
  expect(getRemainingSeconds(next.endsAt, NOW)).toBe(2100);
});

test('module 2 submission completes exam', () => {
  const state = {
    phase: 'module2' as const,
    endsAt: new Date(NOW).toISOString(),
  };

  expect(transitionExam(state, 'SUBMIT', NOW)).toEqual({
    phase: 'results',
    endsAt: null,
  });
});

test('timer never becomes negative', () => {
  const end = new Date(NOW).toISOString();

  expect(getRemainingSeconds(end, NOW + 5000)).toBe(0);
});

test('invalid transitions do not change state', () => {
  const state = createInitialExamState();

  expect(transitionExam(state, 'SUBMIT', NOW)).toEqual(state);
});

test('results phase is final', () => {
  const state = {
    phase: 'results' as const,
    endsAt: null,
  };

  expect(transitionExam(state, 'START', NOW)).toEqual(state);
});

test('TIME_UP cannot advance before deadline', () => {
  const now = Date.parse('2026-10-22T10:00:00.000Z');
  const started = transitionExam(createInitialExamState(), 'START', now);

  const early = transitionExam(started, 'TIME_UP', now + 60_000);

  expect(early).toEqual(started);
});

test('TIME_UP advances after deadline', () => {
  const now = Date.parse('2026-10-22T10:00:00.000Z');
  const started = transitionExam(createInitialExamState(), 'START', now);

  const expired = transitionExam(started, 'TIME_UP', now + 35 * 60_000);

  expect(expired.phase).toBe('break');
  expect(getRemainingSeconds(expired.endsAt, now + 35 * 60_000)).toBe(600);
});

import { recoverExam } from './exam-machine';

test('recovers from module1 into module2 after a long offline period', () => {
  const start = Date.parse('2026-10-22T12:00:00.000Z');

  const state = {
    phase: 'module1' as const,
    endsAt: new Date(start + 35 * 60_000).toISOString(),
  };

  const recovered = recoverExam(state, start + 60 * 60_000);

  expect(recovered.phase).toBe('module2');
  expect(getRemainingSeconds(recovered.endsAt, start + 60 * 60_000)).toBe(20 * 60);
});

test('recovers directly to results when all deadlines have passed', () => {
  const start = Date.parse('2026-10-22T12:00:00.000Z');

  const state = {
    phase: 'module1' as const,
    endsAt: new Date(start + 35 * 60_000).toISOString(),
  };

  const recovered = recoverExam(state, start + 90 * 60_000);

  expect(recovered).toEqual({
    phase: 'results',
    endsAt: null,
  });
});

test('stale module1 submission cannot submit module2', () => {
  const start = Date.parse('2026-10-22T12:00:00.000Z');

  const state = {
    phase: 'module1' as const,
    endsAt: new Date(start + 35 * 60_000).toISOString(),
  };

  const next = transitionExam(state, 'SUBMIT', start + 60 * 60_000);

  expect(next.phase).toBe('module2');
});
