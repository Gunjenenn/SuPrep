// Section G · G2 replaces the body with: auth → rate limit → prompt (G3) → Gemini (Vertex AI) → guard.
// Until then it always answers in demo mode, and says so (`demo: true`). Keys stay on the server.
import { z } from 'zod';
import { demoReply } from '@/server/tutor/demo';

const Body = z.object({
  mode: z.enum(['hint', 'explain', 'desmos', 'similar', 'translate']).default('hint'),
  message: z.string().min(1).max(2000),
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
  return Response.json({ text: demoReply(parsed.data.mode), demo: true });
}
