// Section D · exam reads/writes. Module building (D2) and timing (D1) live in src/features/exam/lib/.
import { getDb } from '@/lib/supabase/server';
import { QUESTIONS } from '@/mocks/questions';

export type ExamModule = { no: 1 | 2; questionIds: string[]; minutes: number };
export type Exam = { id: string; userId: string; startedAt: string; modules: ExamModule[] };

/** Mock: module 1 = first 22 questions. D1/D2 replace this. */
export async function createExam(userId = 'u-demo'): Promise<Exam> {
  const exam: Exam = {
    id: `exam-${Date.now()}`,
    userId,
    startedAt: new Date().toISOString(),
    modules: [{ no: 1, questionIds: QUESTIONS.slice(0, 22).map((q) => q.id), minutes: 35 }],
  };
  const db = await getDb();
  if (!db) return exam;
  const { data, error } = await db
    .from('exams')
    .insert({ user_id: userId, modules: exam.modules })
    .select('id, started_at')
    .single();
  if (error) throw error;
  return { ...exam, id: data.id, startedAt: data.started_at };
}

export async function getExam(id: string): Promise<Exam | null> {
  const db = await getDb();
  if (!db) return null;
  const { data, error } = await db
    .from('exams')
    .select('id, user_id, started_at, modules')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data
    ? { id: data.id, userId: data.user_id, startedAt: data.started_at, modules: data.modules }
    : null;
}
