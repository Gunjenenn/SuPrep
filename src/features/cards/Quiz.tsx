'use client';
import { type FormEvent, useEffect, useState } from 'react';
import { Tex } from '@/components/math/Tex';
import { useT } from '@/lib/i18n-client';
import { isCorrect, type QuizQuestion } from './lib/quiz';
import { speak } from './lib/speech';
import { btn, input } from './ui';

function Option({
  q,
  value,
  picked,
  onPick,
}: {
  q: QuizQuestion;
  value: string;
  picked: string | null;
  onPick: (v: string) => void;
}) {
  const answered = picked !== null;
  const right = value === q.answer;
  const tone = !answered
    ? 'border-(--cd-line) bg-(--cd-panel) hover:border-(--cd-green) hover:bg-(--cd-panel-2)'
    : right
      ? 'border-(--cd-green) bg-[#22c55e]/15 text-[#4ade80]'
      : value === picked
        ? 'border-(--cd-rose) bg-[#3a1717] text-[#fca5a5]'
        : 'border-(--cd-line) bg-(--cd-panel) opacity-50';
  return (
    <button
      type="button"
      disabled={answered}
      onClick={() => onPick(value)}
      className={`w-full rounded-2xl border-2 px-4 py-3 text-left text-[15px] font-semibold text-(--cd-text) transition ${tone}`}
    >
      {q.kind === 'tex' ? <Tex tex={value} /> : value}
    </button>
  );
}

export function Quiz({
  questions,
  onDone,
}: {
  questions: QuizQuestion[];
  onDone: (correct: number) => void;
}) {
  const t = useT('cards');
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [typed, setTyped] = useState('');
  const [correct, setCorrect] = useState(0);
  const q = questions[i];

  useEffect(() => {
    if (q?.kind === 'listen' && q.say) speak(q.say, q.cardId);
  }, [q]);

  if (!q) return null;
  const answered = picked !== null;
  const ok = answered && isCorrect(q, picked);
  const last = i === questions.length - 1;

  const pick = (v: string) => {
    if (answered) return;
    setPicked(v);
    if (isCorrect(q, v)) setCorrect((c) => c + 1);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (typed.trim()) pick(typed);
  };

  const next = () => {
    if (last) return onDone(correct);
    setI(i + 1);
    setPicked(null);
    setTyped('');
  };

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="cd-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#4ade80]">
          {t('quiz.title')}
        </span>
        <div className="flex gap-1.5">
          <span className="sr-only">{t('quiz.step', { n: i + 1, total: questions.length })}</span>
          {questions.map((x, k) => (
            <span
              key={x.id}
              className={`h-2 rounded-full transition-all ${k === i ? 'w-6 bg-(--cd-green)' : k < i ? 'w-2 bg-[#4ade80]' : 'w-2 bg-[#16271d]'}`}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-semibold text-(--cd-muted)">{t(`quiz.${q.kind}`)}</p>
        {q.kind === 'listen' ? (
          <button
            type="button"
            onClick={() => q.say && speak(q.say, q.cardId)}
            className={`${btn.dark} justify-self-start`}
          >
            {t('quiz.replay')}
          </button>
        ) : (
          <h2 className="cd-display text-2xl font-black leading-tight text-(--cd-text)">{q.prompt}</h2>
        )}
      </div>

      {q.kind === 'type' ? (
        <form onSubmit={submit} className="grid gap-3">
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={answered}
            placeholder={t('quiz.placeholder')}
            aria-label={t('quiz.type')}
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            className={`${input} py-3! text-base`}
          />
          {!answered && (
            <button type="submit" disabled={!typed.trim()} className={btn.primary}>
              {t('quiz.check')}
            </button>
          )}
        </form>
      ) : (
        <div className="grid gap-2.5">
          {q.options.map((o) => (
            <Option key={o} q={q} value={o} picked={picked} onPick={pick} />
          ))}
        </div>
      )}

      {answered && (
        <div
          role="status"
          className={`mt-auto rounded-2xl p-4 text-sm font-semibold ${ok ? 'bg-[#22c55e]/15 text-[#4ade80]' : 'bg-[#3a1717] text-[#fca5a5]'}`}
        >
          {ok ? (
            t('quiz.right')
          ) : q.kind === 'tex' ? (
            <>
              {t('quiz.wrongShort')} <Tex tex={q.answer} />
            </>
          ) : (
            t('quiz.wrong', { answer: q.answer })
          )}
        </div>
      )}

      {answered && (
        <button type="button" onClick={next} className={btn.primary}>
          {last ? t('quiz.finish') : t('quiz.next')}
        </button>
      )}
    </div>
  );
}
