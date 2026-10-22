// Section A · reads. Without Supabase every function returns src/mocks data.
import { getDb } from '@/lib/supabase/server';
import { nodeById, STAGES } from '@/mocks/stages';
import type { Lesson, Stage } from '@/types';

export type LessonProgress = { lessonId: string; done: boolean; best: number };

export async function listStages(): Promise<Stage[]> {
  const db = await getDb();
  if (!db) return STAGES;
  const { data, error } = await db.from('stages').select('content').order('no');
  if (error) throw error;
  return (data ?? []).map((r) => r.content as Stage);
}

export async function getLesson(id: string): Promise<Lesson | null> {
  const db = await getDb();
  if (!db) return nodeById(id) ?? null;
  const { data, error } = await db.from('lessons').select('content').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data?.content as Lesson) ?? null;
}

export async function getProgress(userId: string): Promise<LessonProgress[]> {
  const db = await getDb();
  if (!db) return [];
  const { data, error } = await db
    .from('lesson_progress')
    .select('lesson_id, done, best')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((r) => ({ lessonId: r.lesson_id, done: r.done, best: r.best }));
}
