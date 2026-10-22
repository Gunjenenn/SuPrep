import { expect, test } from 'bun:test';
import { getLeague, getStats, listBadges } from './queries';

test('demo stats, 10 badges, sorted league with me', async () => {
  expect((await getStats('u-demo')).xp).toBe(380);
  expect(await listBadges('u-demo')).toHaveLength(10);
  const league = await getLeague('2026-W43');
  expect(league.find((r) => r.me)).toBeTruthy();
  for (let i = 1; i < league.length; i++) expect(league[i - 1].xp).toBeGreaterThanOrEqual(league[i].xp);
});
