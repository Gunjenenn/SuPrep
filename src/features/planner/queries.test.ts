import { expect, test } from 'bun:test';
import { getPlan, listSatDates } from './queries';

test('mock SAT dates are sorted, no plan yet', async () => {
  const dates = await listSatDates();
  expect(dates.length).toBeGreaterThan(0);
  expect([...dates].sort((a, b) => a.d.localeCompare(b.d))).toEqual(dates);
  expect(await getPlan('u-demo')).toBeNull();
});
