// Section D · mistake notebook reads.
import { getDb } from '@/lib/supabase/server';
import type { Mistake } from '@/types';

export async function listMistakes(userId: string): Promise<Mistake[]> {
  const db = await getDb();
  if (!db) return [];
  const { data, error } = await db
    .from('mistakes')
    .select('id, question_id, chosen, created_at, resolved, source, box, due_at')
    .eq('user_id', userId)
    .order('due_at');
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    qid: r.question_id,
    chosen: r.chosen,
    at: Date.parse(r.created_at),
    resolved: r.resolved,
    source: r.source,
    box: r.box,
    due: Date.parse(r.due_at),
  }));
}
