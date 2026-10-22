'use client';
import { useEffect, useRef, useState } from 'react';

/** Number that eases to its new value (XP counter). */
export function CountUp({
  value,
  duration = 900,
  className = '',
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const a = from.current;
    const b = value;
    if (a === b) return;
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / duration);
      setShown(Math.round(a + (b - a) * (1 - (1 - k) ** 3)));
      if (k < 1) raf = requestAnimationFrame(step);
      else from.current = b;
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      from.current = b;
    };
  }, [value, duration]);
  return <span className={`tnum ${className}`}>{shown.toLocaleString('en-US')}</span>;
}
