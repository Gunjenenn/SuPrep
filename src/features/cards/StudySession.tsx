'use client';
import Link from 'next/link';
import { type PointerEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CatHead } from '@/components/brand';
import { useT } from '@/lib/i18n-client';
import { routes } from '@/lib/routes';
import type { Card } from '@/types';
import { gradeCard, saveNote } from './actions';
import { CardBack, CardFront } from './CardFace';
import { buildQuiz, type QuizQuestion, sessionXp } from './lib/quiz';
import { answer, createSession, current, isDone, progress, tally } from './lib/session-queue';
import { Quiz } from './Quiz';
import { Summary } from './Summary';
import { btn, CAT_VARS, faceOf } from './ui';

export const SWIPE_PX = 110;

type Phase = 'study' | 'quiz' | 'summary';

export type StudyDeck = { id: string; title: string; color: string };

function Stamp({
  text,
  tone,
  opacity,
  side,
}: {
  text: string;
  tone: string;
  opacity: number;
  side: 'l' | 'r';
}) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute top-6 z-10 rounded-xl border-4 px-3 py-1 text-2xl font-black tracking-wider ${tone} ${side === 'l' ? 'left-5 -rotate-12' : 'right-5 rotate-12'}`}
      style={{ opacity }}
    >
      {text}
    </span>
  );
}

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[400px]">
      <div className="rounded-[2.75rem] bg-[#040906] p-2.5 shadow-[0_30px_80px_-24px_rgba(0,0,0,0.8)] ring-1 ring-(--cd-line)">
        <div className="relative flex h-[min(760px,calc(100dvh-150px))] min-h-[600px] flex-col overflow-hidden rounded-[2.2rem] bg-(--cd-bg)">
          <div className="mx-auto mt-2 h-5 w-24 shrink-0 rounded-full bg-[#040906]" />
          {children}
        </div>
      </div>
    </div>
  );
}

export function StudySession({
  deck,
  cards,
  pool,
  notes: initialNotes,
  review = false,
  mode = 'study',
}: {
  deck: StudyDeck;
  cards: Card[];
  pool: Card[];
  notes: Record<string, string>;
  review?: boolean;
  mode?: 'study' | 'quiz';
}) {
  const t = useT('cards');
  const byId = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);
  const [face, edge] = faceOf(deck.color);

  const [session, setSession] = useState(() => createSession(mode === 'study' ? cards.map((c) => c.id) : []));
  const [phase, setPhase] = useState<Phase>(mode === 'quiz' ? 'quiz' : 'study');
  const [flipped, setFlipped] = useState(false);
  const [dx, setDx] = useState(0);
  const [fly, setFly] = useState<0 | 1 | -1>(0);
  const [dragging, setDragging] = useState(false);
  const [notes, setNotes] = useState(initialNotes);
  const [nextDue, setNextDue] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [quizCorrect, setQuizCorrect] = useState<number | null>(null);
  const drag = useRef<{ x: number; moved: boolean } | null>(null);
  const busy = useRef(false);

  const id = current(session);
  const card = id ? byId.get(id) : undefined;
  const behind = session.queue.slice(1, 3);
  const { done, total } = progress(session);

  useEffect(() => {
    if (phase === 'study' && cards.length && isDone(session)) setPhase('quiz');
  }, [phase, session, cards.length]);

  useEffect(() => {
    if (phase !== 'quiz' || questions) return;
    const q = buildQuiz(cards, pool);
    if (q.length) setQuestions(q);
    else setPhase('summary');
  }, [phase, questions, cards, pool]);

  const commit = useCallback(
    (knew: boolean) => {
      if (busy.current || !id) return;
      busy.current = true;
      setFly(knew ? 1 : -1);
      gradeCard(id, knew)
        .then((s) => {
          if (s) setNextDue((d) => (d === null ? s.due : Math.min(d, s.due)));
        })
        .catch(() => {});
      window.setTimeout(() => {
        setSession((s) => answer(s, knew));
        setFlipped(false);
        setDx(0);
        setFly(0);
        busy.current = false;
      }, 260);
    },
    [id],
  );

  useEffect(() => {
    if (phase !== 'study') return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el?.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (e.key === 'ArrowRight') commit(true);
      else if (e.key === 'ArrowLeft') commit(false);
      else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, commit]);

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (busy.current || e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, moved: false };
    setDragging(true);
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const x = e.clientX - d.x;
    if (Math.abs(x) > 6) d.moved = true;
    setDx(x);
  };

  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    if (!d) return;
    const x = e.clientX - d.x;
    if (x >= SWIPE_PX) commit(true);
    else if (x <= -SWIPE_PX) commit(false);
    else {
      if (!d.moved) setFlipped((f) => !f);
      setDx(0);
    }
  };

  const onCancel = () => {
    drag.current = null;
    setDragging(false);
    setDx(0);
  };

  const onSaveNote = useCallback(async (cardId: string, text: string) => {
    const ok = await saveNote(cardId, text);
    if (ok)
      setNotes((n) => {
        const next = { ...n };
        if (text.trim()) next[cardId] = text.trim();
        else delete next[cardId];
        return next;
      });
    return ok;
  }, []);

  const restart = () => {
    setSession(createSession(cards.map((c) => c.id)));
    setQuestions(null);
    setQuizCorrect(null);
    setFlipped(false);
    setPhase('study');
  };

  const x = fly ? fly * 520 : dx;
  const ratio = Math.min(1, Math.abs(dx) / SWIPE_PX);
  const counts = { knew: session.knew.length, again: session.again.length };
  const result = tally(session);

  if (!cards.length) {
    return (
      <PhoneFrame>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <div className="rounded-[1.75rem] bg-(--cd-green) p-3">
            <CatHead size={80} mood="sleep" style={CAT_VARS} />
          </div>
          <h2 className="text-xl font-black text-(--cd-text)">{t('study.empty.title')}</h2>
          <p className="text-sm text-(--cd-muted)">{t('study.empty.sub')}</p>
          <Link href={routes.myCards} className={btn.primary}>
            {t('study.empty.add')}
          </Link>
        </div>
      </PhoneFrame>
    );
  }

  return (
    <div className="grid gap-4">
      <PhoneFrame>
        <header className="flex items-center gap-3 px-5 pt-3">
          <Link
            href={routes.cards}
            aria-label={t('study.close')}
            className="grid h-9 w-9 place-items-center rounded-full bg-(--cd-panel) text-lg font-bold text-(--cd-muted) shadow-sm transition hover:text-(--cd-text)"
          >
            ×
          </Link>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-black text-(--cd-text)">{deck.title}</div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#16271d]">
              <div
                className="h-full rounded-full bg-(--cd-green) transition-[width] duration-300"
                style={{
                  width: `${phase === 'study' ? (done / Math.max(1, total)) * 100 : 100}%`,
                }}
              />
            </div>
          </div>
          {phase === 'study' && (
            <span className="text-xs font-bold tabular-nums text-(--cd-muted)">
              {t('study.progress', { done: Math.min(done + 1, total), total })}
            </span>
          )}
        </header>

        {phase === 'study' && (
          <>
            <div className="flex items-center justify-between px-5 pt-3 text-xs font-bold">
              <span className="rounded-full bg-[#3b2614] px-3 py-1 text-[#fdba74]">
                {t('study.again')} <span data-testid="count-again">{counts.again}</span>
              </span>
              {review && (
                <span className="truncate px-2 text-[11px] text-(--cd-muted)">{t('study.review')}</span>
              )}
              <span className="rounded-full bg-[#22c55e]/15 px-3 py-1 text-[#4ade80]">
                {t('study.know')} <span data-testid="count-know">{counts.knew}</span>
              </span>
            </div>

            <div className="relative mx-5 mb-9 mt-4 flex-1">
              {behind
                .map((bid, i) => ({ bid, i }))
                .reverse()
                .map(({ bid, i }) => (
                  <div
                    key={bid}
                    aria-hidden
                    className="absolute inset-0 origin-bottom rounded-3xl border border-(--cd-line) bg-(--cd-panel) transition-transform duration-300"
                    style={{
                      transform: `translateY(${(i + 1) * 14}px) scale(${1 - (i + 1) * 0.06})`,
                      boxShadow: `0 6px 0 ${i ? '#16271d' : edge}`,
                      opacity: 1 - i * 0.25,
                    }}
                  />
                ))}

              {card && (
                <div
                  key={card.id}
                  data-testid="study-card"
                  role="button"
                  tabIndex={0}
                  aria-label={t('study.cardLabel', { word: card.front })}
                  aria-pressed={flipped}
                  onPointerDown={onDown}
                  onPointerMove={onMove}
                  onPointerUp={onUp}
                  onPointerCancel={onCancel}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setFlipped((f) => !f);
                  }}
                  className="absolute inset-0 cursor-grab touch-pan-y select-none outline-none focus-visible:ring-4 focus-visible:ring-[#22c55e]/40 active:cursor-grabbing rounded-3xl"
                  style={{
                    transform: `translateX(${x}px) rotate(${x / 18}deg)`,
                    transition: dragging ? 'none' : 'transform 260ms cubic-bezier(.2,.7,.3,1)',
                  }}
                >
                  <Stamp
                    text={t('study.know')}
                    tone="border-(--cd-green) text-(--cd-green)"
                    opacity={dx > 0 ? ratio : 0}
                    side="l"
                  />
                  <Stamp
                    text={t('study.again')}
                    tone="border-[#f97316] text-[#f97316]"
                    opacity={dx < 0 ? ratio : 0}
                    side="r"
                  />
                  <div className="h-full [perspective:1400px]">
                    <div
                      className="relative h-full transition-transform duration-500 [transform-style:preserve-3d]"
                      style={{ transform: flipped ? 'rotateY(180deg)' : 'none' }}
                    >
                      <div
                        className="absolute inset-0 rounded-3xl border border-(--cd-line) bg-(--cd-panel) p-5 [backface-visibility:hidden]"
                        style={{ boxShadow: `0 8px 0 ${edge}` }}
                      >
                        <CardFront card={card} face={face} />
                      </div>
                      <div
                        className="absolute inset-0 rounded-3xl border border-(--cd-line) bg-(--cd-panel) p-5 [backface-visibility:hidden] [transform:rotateY(180deg)]"
                        style={{ boxShadow: `0 8px 0 ${edge}` }}
                      >
                        <CardBack card={card} note={notes[card.id]} onSaveNote={onSaveNote} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] gap-2 px-5 pb-5 pt-4">
              <button type="button" onClick={() => commit(false)} className={btn.again}>
                ← {t('study.again')}
              </button>
              <button
                type="button"
                onClick={() => setFlipped((f) => !f)}
                aria-label={t('study.flip')}
                className={`${btn.dark} px-3!`}
              >
                ⟲
              </button>
              <button type="button" onClick={() => commit(true)} className={btn.primary}>
                {t('study.know')} →
              </button>
            </div>
          </>
        )}

        {phase === 'quiz' && questions && (
          <div className="flex-1 overflow-y-auto px-5 pb-5 pt-4">
            <Quiz
              questions={questions}
              onDone={(c) => {
                setQuizCorrect(c);
                setPhase('summary');
              }}
            />
          </div>
        )}

        {phase === 'summary' && (
          <div className="flex-1 overflow-y-auto px-5 pb-5 pt-2">
            <Summary
              knew={result.knew}
              again={result.again}
              quiz={
                questions && quizCorrect !== null ? { correct: quizCorrect, total: questions.length } : null
              }
              xp={sessionXp(result.knew, quizCorrect ?? 0)}
              nextDue={nextDue}
              onRestart={restart}
            />
          </div>
        )}
      </PhoneFrame>
      {phase === 'study' && (
        <p className="hidden text-center text-xs font-semibold text-(--cd-muted) md:block">
          {t('study.keys')}
        </p>
      )}
    </div>
  );
}
