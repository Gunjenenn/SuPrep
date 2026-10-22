'use client';
import { type KeyboardEvent, useRef } from 'react';
import { cn } from '@/lib/cn';

export type Segment<V extends string> = { value: V; label: string };

/** Radio-group tabs (Үгс · Томьёо · Миний багц). Arrow keys move the selection. */
export function SegmentedControl<V extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: Segment<V>[];
  value: V;
  onChange: (v: V) => void;
  label: string;
  className?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    const d =
      e.key === 'ArrowRight' || e.key === 'ArrowDown'
        ? 1
        : e.key === 'ArrowLeft' || e.key === 'ArrowUp'
          ? -1
          : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + options.length) % options.length;
    onChange(options[n].value);
    refs.current[n]?.focus();
  };
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('inline-flex rounded-2xl bg-paper-2 border-[1.5px] border-line p-1 gap-1', className)}
    >
      {options.map((o, i) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKey(e, i)}
            className={cn(
              'h-9 px-4 rounded-xl text-[13.5px] font-bold transition-colors',
              on ? 'bg-paper text-ink shadow-[0_2px_0_var(--c-line-2)]' : 'text-ink-2 hover:text-ink',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
