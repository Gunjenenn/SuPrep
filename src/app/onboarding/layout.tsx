import type { ReactNode } from 'react';

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return <main className="min-h-dvh gutter py-8 max-w-3xl mx-auto">{children}</main>;
}
