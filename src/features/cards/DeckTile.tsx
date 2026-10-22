'use client';
import { useRouter } from 'next/navigation';
import { useT } from '@/lib/i18n-client';
import { routes } from '@/lib/routes';
import type { DeckSummary } from './deck-hub';

const FACE: Record<string, [string, string]> = {
  'var(--c-leaf)': ['#16a34a', '#137a3a'],
  'var(--c-teal)': ['#0d9488', '#0f766e'],
  'var(--c-amber)': ['#f59e0b', '#b45309'],
  'var(--c-rose)': ['#f43f5e', '#be123c'],
  'var(--c-forest-2)': ['#145f33', '#0f2e20'],
  'var(--c-moss)': ['#65a30d', '#4d7c0f'],
};

const faceOf = (color: string): [string, string] => FACE[color] ?? ['#16a34a', '#137a3a'];

function DeckStack({ deck }: { deck: DeckSummary }) {
  const [face, edge] = faceOf(deck.color);
  const layer = { background: face, boxShadow: `0 4px 0 ${edge}` };
  return (
    <div className="relative h-36 rounded-xl bg-[#effdf3] [perspective:800px]" aria-hidden>
      <div className="absolute inset-x-12 top-4 bottom-6 rounded-2xl -rotate-6 opacity-40" style={layer} />
      <div className="absolute inset-x-10 top-5 bottom-5 rounded-2xl rotate-3 opacity-70" style={layer} />
      <div
        className="absolute inset-x-8 top-6 bottom-4 grid place-items-center rounded-2xl text-white transition-transform duration-300 group-hover:-translate-y-1"
        style={{ background: face, boxShadow: `0 6px 0 ${edge}` }}
      >
        <div className="grid justify-items-center gap-0.5">
          <span className="text-4xl font-black leading-none tabular-nums">{deck.total}</span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">СууPrep</span>
        </div>
      </div>
    </div>
  );
}

export function DeckTile({ deck }: { deck: DeckSummary }) {
  const t = useT('cards');
  const router = useRouter();
  const pct = Math.round(deck.progress * 100);
  return (
    <article className="group grid h-full content-start gap-4 rounded-2xl border border-[#d9fbe3] bg-white p-5 shadow-[0_1px_0_rgba(12,26,18,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_rgba(15,46,32,0.25)]">
      <DeckStack deck={deck} />
      <div className="min-w-0">
        <h3 className="text-lg font-black leading-snug text-[#0c1a12]">{deck.title}</h3>
        <p className="mt-0.5 truncate text-sm text-[#0c1a12]/55">{deck.sub}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full border border-[#d9fbe3] bg-white px-3 py-1 text-xs font-semibold text-[#0c1a12]/70">
          {t('hub.deck.total', { n: deck.total })}
        </span>
        <span
          className={
            deck.due
              ? 'inline-flex items-center rounded-full border border-[#b4f4c9] bg-[#effdf3] px-3 py-1 text-xs font-semibold text-[#137a3a]'
              : 'inline-flex items-center rounded-full border border-[#d9fbe3] bg-white px-3 py-1 text-xs font-semibold text-[#0c1a12]/45'
          }
        >
          {t('hub.deck.due', { n: deck.due })}
        </span>
      </div>
      <div className="grid gap-1.5">
        <div className="flex justify-between text-xs font-semibold text-[#0c1a12]/55">
          <span>{t('hub.deck.progress')}</span>
          <span className="tabular-nums">{pct}%</span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-[#d9fbe3]"
          role="progressbar"
          aria-label={`${deck.title} · ${t('hub.deck.progress')}`}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-[#16a34a] transition-[width] duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <button
        type="button"
        disabled={deck.disabled}
        onClick={() => router.push(routes.deck(deck.id))}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#16a34a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#137a3a] disabled:cursor-not-allowed disabled:bg-[#16a34a] disabled:opacity-40"
      >
        {t('hub.deck.study')}
      </button>
    </article>
  );
}
