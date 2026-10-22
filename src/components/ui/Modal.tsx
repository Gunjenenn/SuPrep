'use client';
import { type ReactNode, useRef } from 'react';
import { cn } from '@/lib/cn';
import { useDialog } from './useDialog';

export function Modal({
  open,
  onClose,
  label,
  children,
  className,
}: {
  open: boolean;
  onClose?: () => void;
  /** Accessible name, e.g. "Түвшин ахилаа". */
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useDialog(open, ref, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 anim-rise">
      <button
        type="button"
        aria-label="close"
        tabIndex={-1}
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--c-forest)_55%,transparent)] backdrop-blur-[2px] cursor-default"
        onClick={onClose}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cn('card shadow-pop relative w-full max-w-md anim-pop', className)}
      >
        {children}
      </div>
    </div>
  );
}
