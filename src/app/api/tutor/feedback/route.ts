// Section G · POST 👍/👎 (+ optional better explanation) for a Suu reply.
// Supabase when configured; a local JSONL inbox in development; otherwise accepted but not stored.
import { getDb } from '@/lib/supabase/server';
import { FeedbackInput, saveFeedback } from '@/server/tutor/feedback';

export async function POST(req: Request) {
  const parsed = FeedbackInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'bad_request' }, { status: 400 });
  try {
    const db = await getDb();
    const stored = await saveFeedback(parsed.data, {
      db: db as never,
      allowFile: process.env.NODE_ENV !== 'production',
    });
    return Response.json({ ok: true, stored }, { status: stored === 'none' ? 202 : 201 });
  } catch {
    return Response.json({ error: 'save_failed' }, { status: 500 });
  }
}
