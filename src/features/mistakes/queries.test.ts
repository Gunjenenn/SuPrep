import { expect, test } from 'bun:test';
import { listMistakes } from './queries';

test('no mistakes in mock mode', async () => {
  expect(await listMistakes('u-demo')).toEqual([]);
});
