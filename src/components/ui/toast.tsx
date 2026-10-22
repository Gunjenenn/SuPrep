'use client';
import { useSyncExternalStore } from 'react';
import { cn } from '@/lib/cn';

export type ToastTone = 'info' | 'success' | 'xp' | 'danger';
export type ToastItem = { id: number; message: string; tone: ToastTone };

let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => {
  for (const l of listeners) l();
};

/** toast('+40 XP', { tone: 'xp' }) — callable from any client code. Returns the id. */
export function toast(message: string, opts: { tone?: ToastTone; ms?: number } = {}): number {
  const id = nextId++;
  items = [...items, { id, message, tone: opts.tone ?? 'info' }];
  emit();
  setTimeout(() => dismissToast(id), opts.ms ?? 3200);
  return id;
}

export function dismissToast(id: number) {
  items = items.filter((t) => t.id !== id);
  emit();
}

/** test helper */
export function clearToasts() {
  items = [];
  emit();
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const snapshot = () => items;
const EMPTY: ToastItem[] = [];

const TONE: Record<ToastTone, string> = {
  info: 'bg-paper text-ink border-line',
  success: 'bg-sage text-leaf-2 border-sage-2',
  xp: 'bg-forest text-cream border-transparent',
  danger: 'bg-danger-soft text-danger border-transparent',
};

/** Mounted once in the root providers. */
export function Toaster() {
  const list = useSyncExternalStore(subscribe, snapshot, () => EMPTY);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-3 z-[60] grid justify-items-center gap-2 px-4 md:top-auto md:bottom-6 md:right-6 md:left-auto md:justify-items-end"
    >
      {list.map((t) => (
        <output
          key={t.id}
          className={cn(
            'pointer-events-auto rounded-2xl border-[1.5px] px-4 py-2.5 text-[14px] font-bold shadow-pop anim-pop',
            TONE[t.tone],
          )}
        >
          {t.message}
        </output>
      ))}
    </div>
  );
}
