import type { CSSProperties } from 'react';

const COLORS = [
  'var(--c-leaf)',
  'var(--c-lime)',
  'var(--c-rose)',
  'var(--c-moss)',
  'var(--c-teal)',
  'var(--c-ink)',
];

/** Celebration burst; place inside a `relative` parent. Disabled by .calm and reduced motion. */
export function Confetti({ n = 26 }: { n?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2;
        const d = 90 + (i % 5) * 28;
        const style = {
          width: i % 3 ? 7 : 10,
          height: i % 3 ? 7 : 4,
          borderRadius: i % 2 ? 2 : 99,
          background: COLORS[i % COLORS.length],
          '--dx': `${Math.cos(a) * d}px`,
          '--dy': `${Math.sin(a) * d + 40}px`,
          '--rot': `${(i % 7) * 60}deg`,
          animation: `confetti 1.3s cubic-bezier(.2,.7,.3,1) ${(i % 6) * 0.03}s both`,
        } as CSSProperties;
        return <span key={i} className="absolute left-1/2 top-[38%] block" style={style} />;
      })}
    </div>
  );
}
