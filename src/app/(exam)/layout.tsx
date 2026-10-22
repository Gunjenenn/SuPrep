import type { ReactNode } from 'react';

/** Exam mode: no nav, no XP, no animation (.calm). Section D. */
export default function ExamLayout({ children }: { children: ReactNode }) {
  return <main className="calm min-h-dvh gutter py-6">{children}</main>;
}
