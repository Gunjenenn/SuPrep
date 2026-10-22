'use client';
import type { CSSProperties } from 'react';
import { CatHead } from '@/components/brand';
import { CountUp } from '@/components/ui/CountUp';
import { useT } from '@/lib/i18n-client';
import type { CardStatus, StatusCounts } from './deck-hub';

const STATS: { key: CardStatus; dot: string }[] = [
  { key: 'new', dot: 'bg-[#7ee8a4]' },
  { key: 'learning', dot: 'bg-[#fbbf24]' },
  { key: 'mastered', dot: 'bg-[#43d27a]' },
];

const CAT = { '--c-cat': '#0c1a12', '--c-cat-rim': '#1d3a2a' } as CSSProperties;

export function DueBanner({ due, counts }: { due: number; counts: StatusCounts }) {
  const t = useT('cards');
  return (
    <section
      aria-label={t('hub.today', { n: due })}
      className="relative overflow-hidden rounded-3xl bg-[#0f2e20] p-6 text-white md:p-8"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#1fb85b]/30 blur-3xl" />
      <div className="relative flex flex-wrap items-center gap-6">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#43d27a]">
            {t('hub.eyebrow')}
          </div>
          <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">
            {t('hub.today', { n: due })}
          </h2>
          <p className="mt-2 max-w-xl text-white/80">{t('hub.todaySub')}</p>
          <div className="mt-5 grid max-w-md grid-cols-3 gap-3">
            {STATS.map((s) => (
              <div key={s.key} className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10">
                <div className="text-2xl font-black tabular-nums">
                  <CountUp value={counts[s.key]} />
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-white/75">
                  <span className={`h-2 w-2 rounded-full ${s.dot}`} aria-hidden />
                  {t(`hub.stats.${s.key}`)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden rotate-6 rounded-[2rem] bg-[#16a34a] p-4 shadow-2xl sm:block" aria-hidden>
          <CatHead size={120} mood="happy" style={CAT} />
        </div>
      </div>
    </section>
  );
}
