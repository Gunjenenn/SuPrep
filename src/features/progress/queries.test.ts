import { expect, test } from 'bun:test';
import { getLeague, getStats, listBadges } from './queries';

test('demo: fresh stats, 10 badges, empty league', async () => {
  expect((await getStats('u-demo')).xp).toBe(0);
  expect((await getStats('u-demo')).streak).toBe(0);
  expect(await listBadges('u-demo')).toHaveLength(10);
  expect(await getLeague('2026-W43')).toEqual([]);
});
