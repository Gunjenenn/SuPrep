'use client';
import { useId } from 'react';
import { cn } from '@/lib/cn';

export function Switch({
  checked,
  onChange,
  label,
  disabled,
  className,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}) {
  const id = useId();
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-7 w-12 shrink-0 rounded-full border-[1.5px] transition-colors disabled:opacity-40',
          checked ? 'bg-leaf border-leaf-deep' : 'bg-paper-2 border-line-2',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'absolute top-[2px] left-[2px] size-5 rounded-full bg-paper shadow-[0_2px_0_var(--c-edge)] transition-transform',
            checked && 'translate-x-5',
          )}
        />
      </button>
      <label htmlFor={id} className="text-[14px] text-ink select-none">
        {label}
      </label>
    </span>
  );
}
