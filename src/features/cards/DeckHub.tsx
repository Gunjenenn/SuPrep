'use client';
import { type CSSProperties, useState } from 'react';
import { CatHead } from '@/components/brand';
import { useT } from '@/lib/i18n-client';
import type { DeckKind } from '@/types';
import { DeckTile } from './DeckTile';
import { DueBanner } from './DueBanner';
import { byKind, type DeckSummary, type StatusCounts } from './deck-hub';

const KINDS: DeckKind[] = ['word', 'formula', 'mine'];

const CAT = { '--c-cat': '#0c1a12', '--c-cat-rim': '#1d3a2a' } as CSSProperties;

export function DeckHub({
  summaries,
  due,
  counts,
}: {
  summaries: DeckSummary[];
  due: number;
  counts: StatusCounts;
}) {
  const t = useT('cards');
  const [kind, setKind] = useState<DeckKind>('word');
  const decks = byKind(summaries, kind);

  return (
    <section className="grid gap-8 text-[#0c1a12]">
      <header>
        <h1 className="text-3xl font-black tracking-tight md:text-4xl">{t('pages.cards.title')}</h1>
        <p className="mt-3 text-lg text-[#0c1a12]/70">{t('hub.intro')}</p>
      </header>

      <DueBanner due={due} counts={counts} />

      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#0c1a12]/60">{t('hub.decks')}</h2>
          <div
            role="tablist"
            aria-label={t('hub.tabs.label')}
            className="inline-flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-[#d9fbe3] bg-white p-1"
          >
            {KINDS.map((k) => {
              const on = k === kind;
              return (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setKind(k)}
                  className={
                    on
                      ? 'whitespace-nowrap rounded-xl bg-[#16a34a] px-4 py-2 text-sm font-semibold text-white shadow-sm'
                      : 'whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold text-[#0c1a12]/60 transition hover:bg-[#effdf3] hover:text-[#0c1a12]'
                  }
                >
                  {t(`hub.tabs.${k}`)}
                </button>
              );
            })}
          </div>
        </div>

        {decks.length ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {decks.map((d) => (
              <li key={d.id}>
                <DeckTile deck={d} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center rounded-2xl border border-[#d9fbe3] bg-white px-6 py-12 text-center">
            <div className="rounded-[1.75rem] bg-[#16a34a] p-3">
              <CatHead size={80} mood="sleep" style={CAT} />
            </div>
            <h3 className="mt-4 text-xl font-black">{t('hub.empty.title')}</h3>
            <p className="mt-1 max-w-sm text-sm text-[#0c1a12]/60">{t('hub.empty.sub')}</p>
          </div>
        )}
      </div>
    </section>
  );
}
