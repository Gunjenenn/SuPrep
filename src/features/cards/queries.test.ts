import { expect, test } from 'bun:test';
import { getDeck, listDecks, listDueCards } from './queries';

test('mock decks: words and formulas', async () => {
  const decks = await listDecks();
  expect(decks.some((d) => d.kind === 'word')).toBe(true);
  expect(decks.some((d) => d.kind === 'formula')).toBe(true);
  expect((await getDeck('ops'))?.cards.length).toBeGreaterThan(0);
  expect(await getDeck('nope')).toBeNull();
  expect(await listDueCards('u-demo')).toEqual([]);
});
