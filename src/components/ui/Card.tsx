import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

/** Tactile card: paper face, 3px extruded edge. `interactive` lifts on hover. */
export function Card({
  interactive = false,
  pad = 'md',
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { interactive?: boolean; pad?: 'none' | 'sm' | 'md' | 'lg' }) {
  const p = { none: '', sm: 'p-4', md: 'p-5 md:p-6', lg: 'p-6 md:p-8' }[pad];
  return <div className={cn('card', interactive && 'lift', p, className)} {...rest} />;
}
