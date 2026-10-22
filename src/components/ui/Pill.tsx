import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type PillTone = 'neutral' | 'leaf' | 'teal' | 'rose' | 'amber' | 'danger' | 'dark';

const TONE: Record<PillTone, string> = {
  neutral: 'bg-paper-2 text-ink-2 border-line',
  leaf: 'bg-sage text-leaf-2 border-sage-2',
  teal: 'bg-teal-soft text-teal border-transparent',
  rose: 'bg-rose-soft text-rose border-transparent',
  amber: 'bg-amber-soft text-amber border-transparent',
  danger: 'bg-danger-soft text-danger border-transparent',
  dark: 'bg-forest text-cream border-transparent',
};

export function Pill({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: PillTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11.5px] font-semibold whitespace-nowrap',
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
