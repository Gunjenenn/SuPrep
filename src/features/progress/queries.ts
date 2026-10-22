// Section F · stats, badges, league.
import { getDb } from '@/lib/supabase/server';
import { BADGES, LEAGUE_RIVALS } from '@/mocks/meta';
import type { Badge, LeagueRow, Stats } from '@/types';

const DEMO_STATS: Stats = { xp: 380, level: 2, streak: 4, days: [], mastery: {} };

export async function getStats(userId: string): Promise<Stats> {
  const db = await getDb();
  if (!db) return DEMO_STATS;
  const { data, error } = await db
    .from('user_stats')
    .select('xp, level, streak, days, mastery')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data as Stats) ?? { ...DEMO_STATS, xp: 0, level: 1, streak: 0 };
}

/** All badges with `earned` flags. */
export async function listBadges(userId: string): Promise<(Badge & { earned: boolean })[]> {
  const db = await getDb();
  if (!db) return BADGES.map((b, i) => ({ ...b, earned: i < 2 }));
  const { data, error } = await db.from('user_badges').select('badge_id').eq('user_id', userId);
  if (error) throw error;
  const got = new Set((data ?? []).map((r) => r.badge_id as string));
  return BADGES.map((b) => ({ ...b, earned: got.has(b.id) }));
}

export async function getLeague(weekId: string): Promise<LeagueRow[]> {
  const db = await getDb();
  if (!db) {
    return LEAGUE_RIVALS.map(([name, xp], i): LeagueRow => ({ userId: `demo-${i}`, name, xp }))
      .concat({ userId: 'u-demo', name: 'Та', xp: DEMO_STATS.xp, me: true })
      .sort((a, b) => b.xp - a.xp);
  }
  const { data, error } = await db
    .from('league_rows')
    .select('user_id, name, xp')
    .eq('week_id', weekId)
    .order('xp', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({ userId: r.user_id, name: r.name, xp: r.xp }));
}
