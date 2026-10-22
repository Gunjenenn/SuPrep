// Section G · Feedback on Suu's replies (👍/👎 + optional better explanation).
// Saved to Supabase (table tutor_feedback) when configured, otherwise to a local JSONL inbox in development.
// Nothing here trains the model directly: ai/pipeline/feedback.ts checks it and a human approves it first.
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { z } from 'zod';

export const FeedbackInput = z.object({
  mode: z.enum(['hint', 'explain', 'desmos', 'similar', 'translate']),
  context: z
    .object({
      kind: z.enum(['lesson', 'desmos', 'question', 'mistake', 'general']),
      id: z.string().max(100).optional(),
    })
    .optional(),
  prompt: z.string().trim().min(1).max(2000),
  reply: z.string().trim().min(1).max(4000),
  rating: z.enum(['up', 'down']),
  correction: z.string().trim().max(2000).optional(),
  model: z.string().max(50).default('suu'),
});
export type FeedbackInput = z.infer<typeof FeedbackInput>;

/** Row shape shared by the DB table, the local inbox and ai/pipeline/feedback.ts. */
export type FeedbackRow = {
  id: string;
  mode: FeedbackInput['mode'];
  context_kind: string | null;
  context_id: string | null;
  prompt: string;
  reply: string;
  rating: 'up' | 'down';
  correction: string | null;
  model: string;
  status: 'new' | 'approved' | 'rejected';
  created_at: string;
};

export function toRow(input: FeedbackInput, id = crypto.randomUUID(), now = new Date()): FeedbackRow {
  return {
    id,
    mode: input.mode,
    context_kind: input.context?.kind ?? null,
    context_id: input.context?.id ?? null,
    prompt: input.prompt,
    reply: input.reply,
    rating: input.rating,
    correction: input.correction ? input.correction : null,
    model: input.model,
    status: 'new',
    created_at: now.toISOString(),
  };
}

export const LOCAL_INBOX = join(process.cwd(), 'ai', 'data', 'feedback', 'inbox.jsonl');

/** Minimal DB surface so tests can pass a fake. */
type Db = {
  auth: { getUser: () => Promise<{ data: { user: { id: string } | null } }> };
  from: (t: string) => { insert: (row: unknown) => PromiseLike<{ error: unknown }> };
};

export type SaveResult = 'db' | 'file' | 'none';

export async function saveFeedback(
  input: FeedbackInput,
  opts: { db: Db | null; allowFile: boolean; inbox?: string },
): Promise<SaveResult> {
  const row = toRow(input);
  if (opts.db) {
    const { data } = await opts.db.auth.getUser();
    const { id: _id, created_at: _c, status: _s, ...rest } = row;
    const { error } = await opts.db
      .from('tutor_feedback')
      .insert({ ...rest, user_id: data.user?.id ?? null });
    if (error) throw error;
    return 'db';
  }
  if (opts.allowFile) {
    const path = opts.inbox ?? LOCAL_INBOX;
    mkdirSync(dirname(path), { recursive: true });
    appendFileSync(path, `${JSON.stringify(row)}\n`);
    return 'file';
  }
  return 'none';
}
