import { expect, test } from 'bun:test';
import { listOwnPushSubscriptions } from './queries';

test('no subscriptions in mock mode', async () => {
  expect(await listOwnPushSubscriptions()).toEqual([]);
});
