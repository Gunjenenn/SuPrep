import type { ReactNode } from 'react';
import { CatHead } from '@/components/brand/Cat';

export function EmptyState({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="card p-10 text-center grid place-items-center gap-3">
      <CatHead size={70} mood="sleep" />
      <div className="font-display font-bold text-ink">{title}</div>
      {sub && <p className="text-ink-2 text-sm max-w-sm">{sub}</p>}
      {children}
    </div>
  );
}
