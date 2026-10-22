// Section G · G4 · Chat logic for Suu, kept out of the component so it is easy to test.
import type { TutorContext, TutorMode } from '@/types';

export type ChatMsg = {
  id: string;
  role: 'user' | 'suu';
  text: string;
  /** What we sent to /api/tutor for this reply — needed for 👍/👎 feedback. */
  sent?: TutorRequest;
  demo?: boolean;
  status?: 'pending' | 'error';
};

export type TutorRequest = {
  mode: TutorMode;
  message: string;
  raw: boolean;
  context?: { kind: TutorContext['kind']; id?: string };
};

/** Quick actions shown when the chat is about a specific problem. Order = button order. */
export const QUICK_MODES: TutorMode[] = ['hint', 'explain', 'desmos', 'similar', 'translate'];

export type ChatAction = { kind: 'quick'; mode: TutorMode } | { kind: 'free'; text: string };

/** Turns a button press or typed text into an API request. Null when there is nothing to send. */
export function requestFor(action: ChatAction, ctx: TutorContext): TutorRequest | null {
  const context = ctx.kind === 'general' ? undefined : { kind: ctx.kind, id: ctx.id };
  if (action.kind === 'quick') {
    // Quick actions only make sense with a problem: send it exactly like the training data (problem + request phrase).
    if (!ctx.problem) return null;
    return { mode: action.mode, message: withChoice(ctx), raw: false, context };
  }
  const text = action.text.trim();
  if (!text) return null;
  const message = ctx.problem ? `${withChoice(ctx)}\n\n${text}` : text;
  return { mode: 'explain', message: message.slice(0, 2000), raw: true, context };
}

/** The problem text, plus the student's chosen answer when they came from a mistake. */
function withChoice(ctx: TutorContext): string {
  const p = ctx.problem ?? '';
  return ctx.chosen ? `${p}\n\nМиний хариу: ${ctx.chosen}` : p;
}

let counter = 0;
export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}`;

/** Label shown in the user's bubble for a quick action (the problem itself is already on screen). */
export function userBubbleText(action: ChatAction, label: (mode: TutorMode) => string): string {
  return action.kind === 'quick' ? label(action.mode) : action.text.trim();
}

export type ApiReply = { text: string; demo?: boolean };

/** Calls the tutor API. Throws on network or server errors so the caller can show a retry. */
export async function askSuu(req: TutorRequest, fetchImpl: typeof fetch = fetch): Promise<ApiReply> {
  const res = await fetchImpl('/api/tutor', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`tutor ${res.status}`);
  const data = (await res.json()) as Partial<ApiReply>;
  if (!data.text) throw new Error('tutor empty');
  return { text: data.text, demo: Boolean(data.demo) };
}

/** Replace one message by id (immutable update). */
export function patch(list: ChatMsg[], id: string, change: Partial<ChatMsg>): ChatMsg[] {
  return list.map((m) => (m.id === id ? { ...m, ...change } : m));
}
