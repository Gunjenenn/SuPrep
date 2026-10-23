import { expect, test } from 'bun:test';
import { getDeck, listDecks, listDueCards } from './queries';

test('mock decks: words and formulas', async () => {
  const decks = await listDecks();
  expect(decks.some((d) => d.kind === 'word')).toBe(true);
  expect(decks.some((d) => d.kind === 'formula')).toBe(true);
  expect((await getDeck('ops'))?.cards.length).toBeGreaterThan(0);
  expect(await getDeck('nope')).toBeNull();
  // No saved progress in mock mode → every card is new, and new cards count as due (isDue(null) is true).
  const due = await listDueCards('u-demo');
  const total = decks.reduce((n, d) => n + d.cards.length, 0);
  expect(due.length).toBe(total);
  expect(due.every((c) => c.state === null)).toBe(true);
});
