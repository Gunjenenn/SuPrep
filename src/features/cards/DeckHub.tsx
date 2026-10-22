'use client';
import { type KeyboardEvent, useRef, useState } from 'react';
import { useT } from '@/lib/i18n-client';
import type { Card, DeckKind } from '@/types';
import { DeckTile } from './DeckTile';
import { DueBanner } from './DueBanner';
import { byKind, type DeckSummary, dueByKind, KINDS, type StatusCounts } from './deck-hub';
import { MyCardsManager } from './MyDeck';
import { StatsPanel } from './StatsPanel';
import { eyebrow, panel } from './ui';

function Tabs({ value, onChange }: { value: DeckKind; onChange: (k: DeckKind) => void }) {
  const t = useT('cards');
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + KINDS.length) % KINDS.length;
    onChange(KINDS[n]);
    refs.current[n]?.focus();
  };
  return (
    <div
      role="tablist"
      aria-label={t('hub.tabs.label')}
      className="inline-flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-(--cd-line) bg-(--cd-panel) p-1.5"
    >
      {KINDS.map((k, i) => {
        const on = k === value;
        return (
          <button
            key={k}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            aria-selected={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(k)}
            onKeyDown={(e) => onKey(e, i)}
            className={
              on
                ? 'whitespace-nowrap rounded-xl bg-(--cd-bg) px-4 py-2 text-sm font-bold text-(--cd-text) shadow-[0_3px_0_#040a07]'
                : 'whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold text-(--cd-muted) transition hover:text-(--cd-text)'
            }
          >
            {t(`hub.tabs.${k}`)}
          </button>
        );
      })}
    </div>
  );
}

export function DeckHub({
  summaries,
  counts,
  myCards,
  initialKind = 'word',
}: {
  summaries: DeckSummary[];
  counts: Record<DeckKind, StatusCounts>;
  myCards: Card[];
  initialKind?: DeckKind;
}) {
  const t = useT('cards');
  const [kind, setKind] = useState<DeckKind>(initialKind);
  const decks = byKind(summaries, kind);
  const due = dueByKind(summaries)[kind];

  return (
    <section className="grid gap-8 pb-8">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div className="min-w-0 max-w-2xl">
          <div className={`${eyebrow} text-[#4ade80]`}>{t('hub.eyebrow')}</div>
          <h1 className="cd-display mt-2 text-4xl font-black leading-tight md:text-5xl">
            {t(`hub.titles.${kind}`)}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-(--cd-muted)">{t('hub.desc')}</p>
        </div>
        <Tabs value={kind} onChange={setKind} />
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <DueBanner kind={kind} due={due} />
        <StatsPanel counts={counts[kind]} />
      </div>

      {decks.length > 0 && (
        <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((d) => (
            <li key={d.id}>
              <DeckTile deck={d} />
            </li>
          ))}
        </ul>
      )}

      {decks.length === 0 && kind !== 'mine' && (
        <div className={`${panel} px-6 py-10 text-center text-(--cd-muted)`}>{t('hub.empty.title')}</div>
      )}

      {kind === 'mine' && <MyCardsManager cards={myCards} />}

      {kind === 'formula' && <p className="text-xs text-(--cd-muted)">{t('hub.formulaNote')}</p>}
    </section>
  );
}
