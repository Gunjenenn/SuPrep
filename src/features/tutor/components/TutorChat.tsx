'use client';
// Section G · G4 · Chat with Suu. Quick actions (hint, explain, Desmos, similar, translate) for a problem,
// free chat for anything else. Math renders with KaTeX; every real (non-demo) reply gets 👍/👎.
import { type FormEvent, type KeyboardEvent, useEffect, useId, useRef, useState } from 'react';
import { CatHead, type CatMood } from '@/components/brand';
import { Rich } from '@/components/math';
import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { useT } from '@/lib/i18n-client';
import type { TutorContext, TutorMode } from '@/types';
import {
  askSuu,
  type ChatAction,
  type ChatMsg,
  newId,
  patch,
  QUICK_MODES,
  requestFor,
  userBubbleText,
} from '../lib/chat';
import { FeedbackButtons } from './FeedbackButtons';

type Props = {
  context: TutorContext;
  /** Example questions for an empty general chat. */
  starters?: string[];
  fetchImpl?: typeof fetch;
};

export function TutorChat({ context, starters = [], fetchImpl = fetch }: Props) {
  const t = useT('tutor');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const busy = messages.some((m) => m.status === 'pending');
  const last = messages.at(-1);
  const mood: CatMood = busy
    ? 'think'
    : last?.status === 'error'
      ? 'wow'
      : last?.role === 'suu'
        ? 'happy'
        : 'idle';

  useEffect(() => {
    // scroll to the newest message (happy-dom in tests may not implement scrollIntoView)
    if (messages.length === 0) return;
    endRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  async function run(action: ChatAction, retryOf?: string) {
    const req = requestFor(action, context);
    if (!req || busy) return;
    const replyId = retryOf ?? newId('suu');
    if (retryOf) {
      setMessages((list) => patch(list, retryOf, { status: 'pending', text: '' }));
    } else {
      const label = (m: TutorMode) => t(`modes.${m}`);
      setMessages((list) => [
        ...list,
        { id: newId('me'), role: 'user', text: userBubbleText(action, label) },
        { id: replyId, role: 'suu', text: '', status: 'pending', sent: req },
      ]);
      setDraft('');
    }
    try {
      const reply = await askSuu(req, fetchImpl);
      setMessages((list) => patch(list, replyId, { text: reply.text, demo: reply.demo, status: undefined }));
    } catch {
      setMessages((list) => patch(list, replyId, { status: 'error' }));
    }
  }

  function retry(msg: ChatMsg) {
    const userBefore = messages[messages.findIndex((m) => m.id === msg.id) - 1];
    if (!msg.sent || !userBefore) return;
    const action: ChatAction = msg.sent.raw
      ? { kind: 'free', text: userBefore.text }
      : { kind: 'quick', mode: msg.sent.mode };
    void run(action, msg.id);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void run({ kind: 'free', text: draft });
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void run({ kind: 'free', text: draft });
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-4 px-4 py-6">
      <header className="flex items-center gap-3">
        <CatHead size={56} mood={mood} />
        <div>
          <h1 className="text-xl font-black text-ink">{t('pages.tutor.title')}</h1>
          <p className="text-[13px] text-ink-3">{busy ? t('chat.thinking') : t('chat.subtitle')}</p>
        </div>
      </header>

      {context.problem && (
        <section aria-label={t('chat.problem')} className="rounded-2xl border border-line bg-paper p-4">
          <div className="mb-2 flex items-center gap-2">
            <Pill tone="leaf">{context.title}</Pill>
            {context.chosen && <Pill tone="rose">{t('chat.yourAnswer', { answer: context.chosen })}</Pill>}
          </div>
          <Rich text={context.problem} className="text-[15px] leading-relaxed text-ink" />
          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK_MODES.map((m) => (
              <Button
                key={m}
                size="sm"
                variant="soft"
                disabled={busy}
                onClick={() => void run({ kind: 'quick', mode: m })}
              >
                {t(`modes.${m}`)}
              </Button>
            ))}
          </div>
        </section>
      )}

      <ol aria-live="polite" className="grid gap-3">
        {messages.length === 0 && !context.problem && (
          <li className="rounded-2xl bg-paper-2 p-4 text-[14px] text-ink-2">
            <p className="mb-3">{t('chat.empty')}</p>
            <div className="flex flex-wrap gap-2">
              {starters.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant="secondary"
                  onClick={() => void run({ kind: 'free', text: s })}
                >
                  {s}
                </Button>
              ))}
            </div>
          </li>
        )}
        {messages.map((m) => (
          <li key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            {m.role === 'user' ? (
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-forest px-4 py-2.5 text-[15px] text-cream">
                <Rich text={m.text} />
              </div>
            ) : (
              <SuuBubble msg={m} onRetry={() => retry(m)} />
            )}
          </li>
        ))}
      </ol>
      <div ref={endRef} />

      <form
        onSubmit={onSubmit}
        className="sticky bottom-3 flex items-end gap-2 rounded-2xl border border-line bg-paper p-2 shadow-pop"
      >
        <label htmlFor={inputId} className="sr-only">
          {t('chat.inputLabel')}
        </label>
        <textarea
          id={inputId}
          rows={1}
          maxLength={1500}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          placeholder={t('chat.placeholder')}
          className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-2 py-2.5 text-[15px] text-ink outline-none"
        />
        <Button type="submit" disabled={busy || !draft.trim()}>
          {t('chat.send')}
        </Button>
      </form>
    </div>
  );
}

function SuuBubble({ msg, onRetry }: { msg: ChatMsg; onRetry: () => void }) {
  const t = useT('tutor');
  if (msg.status === 'pending') {
    return (
      <div className="rounded-2xl rounded-bl-md bg-paper-2 px-4 py-3 text-[15px] text-ink-3" role="status">
        <span className="animate-pulse">{t('chat.thinking')}</span>
      </div>
    );
  }
  if (msg.status === 'error') {
    return (
      <div className="flex items-center gap-3 rounded-2xl rounded-bl-md bg-danger-soft px-4 py-3 text-[14px] text-danger">
        <span>{t('chat.error')}</span>
        <Button size="sm" variant="danger" onClick={onRetry}>
          {t('chat.retry')}
        </Button>
      </div>
    );
  }
  return (
    <div className="grid max-w-[85%] gap-2 rounded-2xl rounded-bl-md bg-paper-2 px-4 py-3">
      {msg.demo && (
        <Pill tone="amber" className="w-fit">
          {t('chat.demo')}
        </Pill>
      )}
      <Rich text={msg.text} className="text-[15px] leading-relaxed text-ink" />
      {!msg.demo && msg.sent && (
        <FeedbackButtons
          mode={msg.sent.mode}
          prompt={msg.sent.message}
          reply={msg.text}
          context={msg.sent.context}
        />
      )}
    </div>
  );
}
