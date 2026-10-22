import { expect, test } from 'bun:test';
import { getProfile } from './queries';

test('demo profile without Supabase', async () => {
  const p = await getProfile();
  expect(p.onboarded).toBe(true);
  expect(p.target).toBe(700);
});
