// Section G · Suu tutor. Uses the fine-tuned small model on Ollama when OLLAMA_URL is set
// (see ai/train/suu_finetune.ipynb). Otherwise, or if Ollama fails, answers in demo mode and says so (`demo: true`).
// Keys and model URLs stay on the server.
import { z } from 'zod';
import { demoReply } from '@/server/tutor/demo';
import { ollamaReply } from '@/server/tutor/ollama';

const Body = z.object({
  mode: z.enum(['hint', 'explain', 'desmos', 'similar', 'translate']).default('hint'),
  message: z.string().min(1).max(2000),
  /** Free chat: send the student's text as is, without the quick-action request phrase. */
  raw: z.boolean().default(false),
  context: z
    .object({
      kind: z.enum(['lesson', 'desmos', 'question', 'mistake', 'general']),
      id: z.string().optional(),
    })
    .optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'bad_request' }, { status: 400 });
  const { mode, message, raw } = parsed.data;

  const text = await ollamaReply(mode, message, fetch, raw);
  if (text) return Response.json({ text, demo: false, model: 'suu' });
  return Response.json({ text: demoReply(mode), demo: true });
}
