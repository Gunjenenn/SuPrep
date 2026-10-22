'use client';
import Link from 'next/link';
import { CountUp } from '@/components/ui/CountUp';
import { useT } from '@/lib/i18n-client';
import { routes } from '@/lib/routes';
import type { DeckKind } from '@/types';
import { DeckStack } from './DeckStack';
import { PlayIcon } from './icons';
import { reviewDeckId } from './my-deck';
import { btn, eyebrow } from './ui';

export function DueBanner({ kind, due }: { kind: DeckKind; due: number }) {
  const t = useT('cards');
  const label = (
    <>
      <PlayIcon className="h-4 w-4" />
      {t('hub.start')}
    </>
  );
  return (
    <section
      aria-label={t('hub.today')}
      className="relative overflow-hidden rounded-3xl border border-(--cd-line) bg-[linear-gradient(135deg,#0f2a1d_0%,#0b1e15_100%)] p-6 md:p-7"
    >
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-[#22c55e]/15 blur-3xl" />
      <div className="relative flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className={`${eyebrow} text-(--cd-lime)`}>{t('hub.today')}</div>
          <div className="mt-3 flex items-end gap-3">
            <span className="cd-display text-6xl font-black leading-none">
              <CountUp value={due} />
            </span>
            <span className="pb-1 text-[15px] text-(--cd-muted)">{t('hub.waiting')}</span>
          </div>
          <div className="mt-6">
            {due ? (
              <Link href={routes.deck(reviewDeckId(kind))} className={`${btn.lime} px-6 py-3`}>
                {label}
              </Link>
            ) : (
              <button type="button" disabled className={`${btn.lime} px-6 py-3`}>
                {label}
              </button>
            )}
          </div>
        </div>
        <div className="hidden pr-2 sm:block">
          <DeckStack glyph={kind === 'formula' ? 'πr²' : 'Aa'} face="#22c55e" edge="#15803d" size="sm" />
        </div>
      </div>
    </section>
  );
}
