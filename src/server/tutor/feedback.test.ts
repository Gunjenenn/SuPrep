import { expect, test } from 'bun:test';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { FeedbackInput, saveFeedback } from './feedback';

const input = FeedbackInput.parse({
  mode: 'explain',
  context: { kind: 'question', id: 'a1' },
  prompt: 'If $3x+5\\le 20$ ...',
  reply: 'Хариу: 5',
  rating: 'down',
  correction: '  $3x \\le 15$ тул $x \\le 5$.  ',
});

test('validation trims text and rejects bad rating', () => {
  expect(input.correction).toBe('$3x \\le 15$ тул $x \\le 5$.');
  expect(FeedbackInput.safeParse({ ...input, rating: 'meh' }).success).toBe(false);
});

test('local inbox in dev', async () => {
  const inbox = join(mkdtempSync(join(tmpdir(), 'fb-')), 'inbox.jsonl');
  expect(await saveFeedback(input, { db: null, allowFile: true, inbox })).toBe('file');
  const row = JSON.parse(readFileSync(inbox, 'utf8').trim());
  expect(row).toMatchObject({ status: 'new', rating: 'down', context_id: 'a1', mode: 'explain' });
});

test('not stored when no db and files not allowed (production)', async () => {
  expect(await saveFeedback(input, { db: null, allowFile: false })).toBe('none');
});

test('db insert never lets the client set status', async () => {
  let inserted: Record<string, unknown> = {};
  const db = {
    auth: { getUser: async () => ({ data: { user: { id: 'u1' } } }) },
    from: () => ({
      insert: async (row: unknown) => {
        inserted = row as Record<string, unknown>;
        return { error: null };
      },
    }),
  };
  expect(await saveFeedback(input, { db, allowFile: false })).toBe('db');
  expect(inserted.user_id).toBe('u1');
  expect('status' in inserted).toBe(false);
  expect('id' in inserted).toBe(false);
});
