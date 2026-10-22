// Suu on a small fine-tuned model (Qwen2.5-1.5B + LoRA, see ai/train/suu_finetune.ipynb) served by Ollama.
// Server-only. When OLLAMA_URL is empty or Ollama is down, the route falls back to demo replies.

import { serverEnv } from '@/server/env';
import type { TutorMode } from '@/types';

/** Same system prompt the model was fine-tuned with (ai/train/export.ts). Keep them in sync. */
export const SUU_SYSTEM_PROMPT =
  'Чи бол "Суу" — монгол сурагчдад SAT Math заадаг эелдэг багш. Үргэлж монголоор, богино, ойлгомжтой хариул. ' +
  'Математикийг $…$ дотор бич. Сурагч зөвлөгөө (hint) асуувал эцсийн хариуг БҮҮ хэл — зөвхөн дараагийн алхмыг заа. ' +
  'Тайлбар асуувал алхам алхмаар бодоод, төгсгөлд "Хариу: …" гэж бич.';

/** Phrases match the training data, so the model sees familiar requests. */
const MODE_ASK: Record<TutorMode, string> = {
  hint: 'Зөвлөгөө өгөөч, хариуг нь битгий хэлээрэй.',
  explain: 'Алхам алхмаар тайлбарлаж өгөөч.',
  desmos: 'Үүнийг Desmos ашиглаад яаж бодох вэ?',
  similar: 'Үүнтэй төстэй өөр нэг бодлого өгөөч.',
  translate: 'Энэ асуултын англи үгсийг ойлгохгүй байна. Монголоор тайлбарлаач.',
};

export function buildUserMessage(mode: TutorMode, message: string): string {
  return `${message.trim()}\n\n${MODE_ASK[mode]}`;
}

export function hasOllama(): boolean {
  return Boolean(serverEnv().ollamaUrl);
}

type OllamaChat = { message?: { content?: string } };

/** Returns the model's reply, or null if Ollama is not configured / not reachable / too slow. */
export async function ollamaReply(
  mode: TutorMode,
  message: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  const { ollamaUrl, ollamaModel } = serverEnv();
  if (!ollamaUrl) return null;
  try {
    const res = await fetchImpl(`${ollamaUrl.replace(/\/$/, '')}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        stream: false,
        options: { temperature: 0.3, num_predict: 400 },
        messages: [
          { role: 'system', content: SUU_SYSTEM_PROMPT },
          { role: 'user', content: buildUserMessage(mode, message) },
        ],
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as OllamaChat;
    const text = data.message?.content?.trim();
    return text ? text : null;
  } catch {
    return null;
  }
}
