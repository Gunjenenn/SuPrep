import type { CSSProperties } from 'react';

export const CAT_VARS = { '--c-cat': '#0c1a12', '--c-cat-rim': '#1d3a2a' } as CSSProperties;

export const CONFETTI_VARS = {
  '--c-leaf': '#22c55e',
  '--c-lime': '#c4f26a',
  '--c-rose': '#f87171',
  '--c-moss': '#a8bf7c',
  '--c-teal': '#5fb8c9',
  '--c-ink': '#e9f4ed',
} as CSSProperties;

export const panel = 'rounded-3xl border border-(--cd-line) bg-(--cd-panel)';

export const eyebrow = 'cd-mono text-[11px] font-bold uppercase tracking-[0.22em]';

const base =
  'cd-btn inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold mb-1';

export const btn = {
  primary: `${base} [--face:#22c55e] [--edge:#15803d] text-white`,
  lime: `${base} [--face:var(--cd-lime)] [--edge:var(--cd-lime-edge)] text-[#10210f]`,
  dark: `${base} [--face:#15281e] [--edge:#08110c] border border-(--cd-line) text-(--cd-text)`,
  again: `${base} [--face:#3b2614] [--edge:#21150a] text-[#fdba74]`,
};

export const input =
  'w-full rounded-xl border border-(--cd-line) bg-[#0a1610] px-3.5 py-3 text-sm text-(--cd-text) outline-none transition placeholder:text-(--cd-muted) focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/25 aria-[invalid=true]:border-[#f87171]';

const FACE: Record<string, [string, string]> = {
  'var(--c-leaf)': ['#22c55e', '#15803d'],
  'var(--c-teal)': ['#5fb8c9', '#3a8796'],
  'var(--c-amber)': ['#f2b553', '#b07a22'],
  'var(--c-rose)': ['#e8a196', '#a8584d'],
  'var(--c-forest-2)': ['#11281c', '#06110b'],
  'var(--c-moss)': ['#a8bf7c', '#6f8549'],
};

export const faceOf = (color: string): [string, string] => FACE[color] ?? ['#22c55e', '#15803d'];

const GLYPH: Record<string, string> = {
  ops: 'Σ ×',
  compare: '≥ ≤',
  algebra: 'y=mx',
  geo: 'πr',
  'f-given': 'A=πr²',
  'f-memo': 'b²−4ac',
};

export const glyphOf = (deckId: string, title: string) => GLYPH[deckId] ?? title.slice(0, 2);
