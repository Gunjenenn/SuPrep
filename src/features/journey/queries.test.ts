import { expect, test } from 'bun:test';
import { getLesson, getProgress, listStages } from './queries';

test('falls back to mock stages without Supabase', async () => {
  const stages = await listStages();
  expect(stages.map((s) => s.no)).toEqual([1, 2, 3, 4, 5]);
  expect(await getLesson('s1-l3')).not.toBeNull();
  expect(await getLesson('nope')).toBeNull();
  expect(await getProgress('u-demo')).toEqual([]);
});
