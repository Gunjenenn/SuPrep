'use client';
import Link from 'next/link';
import { CatHead } from '@/components/brand';
import { Confetti } from '@/components/ui/Confetti';
import { useT } from '@/lib/i18n-client';
import { routes } from '@/lib/routes';
import { TZ } from '@/lib/time';
import { reviewDay } from './lib/leitner';
import { btn, CAT_VARS, CONFETTI_VARS } from './ui';

function nextLabel(due: number | null, t: (k: string) => string): string {
  if (due === null) return '—';
  const day = reviewDay(due);
  if (day !== 'later') return t(`summary.${day}`);
  return new Intl.DateTimeFormat('mn-MN', { month: 'long', day: 'numeric', timeZone: TZ }).format(due);
}

export function Summary({
  knew,
  again,
  quiz,
  xp,
  nextDue,
  onRestart,
}: {
  knew: number;
  again: number;
  quiz: { correct: number; total: number } | null;
  xp: number;
  nextDue: number | null;
  onRestart: () => void;
}) {
  const t = useT('cards');
  const stats = [
    { label: t('summary.knew'), value: String(knew), tone: 'text-[#4ade80]' },
    { label: t('summary.again'), value: String(again), tone: 'text-(--cd-amber)' },
    ...(quiz
      ? [{ label: t('summary.quiz'), value: `${quiz.correct}/${quiz.total}`, tone: 'text-(--cd-text)' }]
      : []),
    { label: 'XP', value: `+${xp}`, tone: 'text-(--cd-green)' },
  ];
  return (
    <div className="relative flex h-full flex-col items-center gap-5 text-center" style={CONFETTI_VARS}>
      <Confetti />
      <div className="mt-4 rotate-6 rounded-[1.75rem] bg-(--cd-green) p-3 shadow-xl">
        <CatHead size={88} mood="happy" style={CAT_VARS} />
      </div>
      <div>
        <h2 className="cd-display text-2xl font-black">{t('summary.title')}</h2>
        <p className="mt-1 text-sm text-(--cd-muted)">{t('summary.sub')}</p>
      </div>
      <div className="grid w-full grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-(--cd-line) bg-(--cd-panel) p-4">
            <div className={`text-2xl font-black tabular-nums ${s.tone}`}>{s.value}</div>
            <div className="mt-1 text-xs font-semibold text-(--cd-muted)">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="w-full rounded-2xl bg-(--cd-panel-2) p-4 text-left text-(--cd-text)">
        <div className="cd-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#4ade80]">
          {t('summary.next')}
        </div>
        <div className="mt-1 text-lg font-black">{nextLabel(nextDue, t)}</div>
      </div>
      <div className="mt-auto grid w-full gap-2">
        <Link href={routes.cards} className={btn.primary}>
          {t('summary.back')}
        </Link>
        <button type="button" onClick={onRestart} className={btn.dark}>
          {t('summary.restart')}
        </button>
      </div>
    </div>
  );
}
