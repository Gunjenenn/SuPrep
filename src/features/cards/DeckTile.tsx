'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { CSSProperties } from 'react';
import { useT } from '@/lib/i18n-client';
import { routes } from '@/lib/routes';
import { DeckStack } from './DeckStack';
import type { DeckSummary } from './deck-hub';
import { BoltIcon, PencilIcon, PlayIcon } from './icons';
import { MY_DECK_ID } from './my-deck';
import { btn, faceOf, glyphOf } from './ui';

export function DeckTile({ deck }: { deck: DeckSummary }) {
  const t = useT('cards');
  const router = useRouter();
  const [face, edge] = faceOf(deck.color);
  const share = (n: number) => `${deck.total ? (n / deck.total) * 100 : 0}%`;
  const glyph = deck.id === MY_DECK_ID ? <PencilIcon className="h-8 w-8" /> : glyphOf(deck.id, deck.title);
  return (
    <article className="group grid content-start gap-3">
      <div className="grid h-48 place-items-center">
        <DeckStack glyph={glyph} face={face} edge={edge} />
      </div>
      <div className="flex items-start justify-between gap-3">
        <h3 className="cd-display text-lg font-black leading-snug">{deck.title}</h3>
        {deck.due > 0 && (
          <span className="shrink-0 rounded-full border border-[#22c55e]/40 bg-[#22c55e]/10 px-2.5 py-0.5 text-xs font-bold text-[#4ade80]">
            {t('hub.deck.due', { n: deck.due })}
          </span>
        )}
      </div>
      <p className="-mt-2 truncate text-sm text-(--cd-muted)">
        {deck.sub} · {t('hub.deck.total', { n: deck.total })}
      </p>
      <div
        className="mt-1 flex h-2 overflow-hidden rounded-full bg-[#16271d]"
        role="progressbar"
        aria-label={`${deck.title} · ${t('hub.deck.progress')}`}
        aria-valuenow={Math.round(deck.total ? (deck.mastered / deck.total) * 100 : 0)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-(--cd-green) transition-[width] duration-700"
          style={{ width: share(deck.mastered) }}
        />
        <div
          className="h-full bg-(--cd-amber) transition-[width] duration-700"
          style={{ width: share(deck.learning) }}
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={deck.disabled}
          onClick={() => router.push(routes.deck(deck.id))}
          className={`${btn.primary} min-w-28`}
          style={{ '--face': face, '--edge': edge } as CSSProperties}
        >
          <PlayIcon />
          {t('hub.deck.study')}
        </button>
        <Link href={routes.deckQuiz(deck.id)} className={`${btn.dark} min-w-24`}>
          <BoltIcon />
          {t('hub.deck.test')}
        </Link>
      </div>
    </article>
  );
}
