import { expect, test } from 'bun:test';
import { getQuestion, getSaved, listQuestions } from './queries';

test('mock questions and filters', async () => {
  const all = await listQuestions();
  expect(all.length).toBeGreaterThanOrEqual(30);
  const hard = await listQuestions({ difficulty: 3 });
  expect(hard.length).toBeGreaterThan(0);
  expect(hard.every((q) => q.difficulty === 3)).toBe(true);
  expect((await listQuestions({ domain: 'geo' })).every((q) => q.domain === 'geo')).toBe(true);
  expect((await listQuestions({ desmosOnly: true })).every((q) => q.desmos)).toBe(true);
  expect((await getQuestion('a2'))?.answer).toBe(1);
  expect(await getSaved('u-demo')).toEqual([]);
});
