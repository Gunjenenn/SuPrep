'use client';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

export type BarTone = 'leaf' | 'moss' | 'teal' | 'rose' | 'lime' | 'amber';
const TONE: Record<BarTone, string> = {
  leaf: 'bg-leaf',
  moss: 'bg-moss',
  teal: 'bg-teal',
  rose: 'bg-rose',
  lime: 'bg-lime',
  amber: 'bg-amber',
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Progress bar. `value` is 0..1; it animates from 0 on mount. */
export function Bar({
  value,
  tone = 'leaf',
  h = 8,
  label,
  className,
}: {
  value: number;
  tone?: BarTone;
  h?: number;
  label?: string;
  className?: string;
}) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = requestAnimationFrame(() => setW(value));
    return () => cancelAnimationFrame(t);
  }, [value]);
  return (
    <div
      className={cn(
        'w-full rounded-full bg-paper-2 overflow-hidden shadow-[inset_0_2px_0_rgba(0,0,0,.06)]',
        className,
      )}
      style={{ height: h }}
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(clamp01(value) * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          'h-full rounded-full bar-fill shadow-[inset_0_-2px_0_rgba(0,0,0,.14),inset_0_2px_0_rgba(255,255,255,.25)]',
          TONE[tone],
        )}
        style={{ width: `${clamp01(w) * 100}%` }}
      />
    </div>
  );
}
