import type { ReactNode } from 'react';

const SIZE = {
  lg: 'h-32 w-48 text-3xl',
  sm: 'h-[5.5rem] w-32 text-2xl',
};

export function DeckStack({
  glyph,
  face,
  edge,
  size = 'lg',
}: {
  glyph: ReactNode;
  face: string;
  edge: string;
  size?: keyof typeof SIZE;
}) {
  return (
    <div className={`relative ${SIZE[size]}`} aria-hidden="true">
      <div
        className="absolute inset-0 translate-x-3 -translate-y-3 rotate-2 rounded-2xl opacity-60"
        style={{ background: edge }}
      />
      <div
        className="absolute inset-0 translate-x-1.5 -translate-y-1.5 -rotate-1 rounded-2xl opacity-90"
        style={{ background: face, filter: 'brightness(0.82)' }}
      />
      <div
        className="absolute inset-0 grid -rotate-3 place-items-center rounded-2xl transition-transform duration-300 group-hover:-translate-y-1 group-hover:-rotate-1"
        style={{ background: face, boxShadow: `0 6px 0 ${edge}, 0 18px 30px -12px rgba(0,0,0,0.6)` }}
      >
        <span className="cd-display font-black text-white [text-shadow:0_2px_0_rgba(0,0,0,0.18)]">
          {glyph}
        </span>
      </div>
    </div>
  );
}
