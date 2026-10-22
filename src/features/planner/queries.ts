// Section I · study plan. I4 builds the plan in src/features/planner/lib/.
import { getDb } from '@/lib/supabase/server';
import { PHASES, SAT_DATES } from '@/mocks/meta';

export type SatDate = { d: string; reg: string; late: string };
export type Plan = { examDate: string; target: number; phases: { n: string; what: string; f: number }[] };

export async function listSatDates(): Promise<SatDate[]> {
  const db = await getDb();
  if (!db) return SAT_DATES;
  const { data, error } = await db.from('sat_dates').select('d, reg, late').order('d');
  if (error) throw error;
  return data ?? [];
}

export async function getPlan(userId: string): Promise<Plan | null> {
  const db = await getDb();
  if (!db) return null;
  const { data, error } = await db
    .from('plans')
    .select('exam_date, target, phases')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ? { examDate: data.exam_date, target: data.target, phases: data.phases ?? PHASES } : null;
}
