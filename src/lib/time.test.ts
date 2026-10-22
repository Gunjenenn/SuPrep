import { expect, test } from 'bun:test';
import { dayKey } from './time';

test('dayKey uses Ulaanbaatar time (UTC+8)', () => {
  expect(dayKey(new Date('2026-10-21T15:59:00Z'))).toBe('2026-10-21'); // 23:59 UB
  expect(dayKey(new Date('2026-10-21T16:01:00Z'))).toBe('2026-10-22'); // 00:01 UB
});
