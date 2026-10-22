'use client';
import { type PointerEvent, type ReactNode, useRef } from 'react';
import { cn } from '@/lib/cn';

/** Pointer-driven 3D tilt for hero objects and feature cards (off for touch). */
export function Tilt({
  children,
  className,
  max = 8,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType === 'touch') return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--ry', `${x * max}deg`);
    el.style.setProperty('--rx', `${-y * max}deg`);
  };
  const leave = () => {
    ref.current?.style.setProperty('--ry', '0deg');
    ref.current?.style.setProperty('--rx', '0deg');
  };
  return (
    <div className={cn('tilt-wrap', className)} onPointerMove={move} onPointerLeave={leave}>
      <div ref={ref} className="tilt-inner h-full">
        {children}
      </div>
    </div>
  );
}
