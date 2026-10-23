import type { ReactNode } from 'react';
import { AppShell, type ShellUser } from '@/components/shell/AppShell';
import { getProfile } from '@/features/home/queries';
import { getStats } from '@/features/progress/queries';
import { calculateLevel } from '@/lib/level';

async function loadUser(): Promise<ShellUser | undefined> {
  try {
    const profile = await getProfile();
    const stats = await getStats(profile.id);
    return { name: profile.name, level: calculateLevel(stats.xp).level, xp: stats.xp, streak: stats.streak };
  } catch {
    // the shell still renders without stats (e.g. Supabase offline)
    return undefined;
  }
}

export default async function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell user={await loadUser()}>{children}</AppShell>;
}
