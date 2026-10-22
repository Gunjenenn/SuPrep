// Section C · reads.
import { getDb } from '@/lib/supabase/server';
import { QUESTIONS } from '@/mocks/questions';
import type { Question, QuestionFilter } from '@/types';

/** Simple mock-side filter. C2 replaces it with lib/filter-questions.ts (tested). */
function filterMock(list: Question[], f: QuestionFilter): Question[] {
  const q = f.search?.trim().toLowerCase();
  return list.filter(
    (x) =>
      (!f.domain || x.domain === f.domain) &&
      (!f.difficulty || x.difficulty === f.difficulty) &&
      (!f.desmosOnly || Boolean(x.desmos)) &&
      (!q || x.prompt.toLowerCase().includes(q) || x.skill.toLowerCase().includes(q)),
  );
}

export async function listQuestions(filter: QuestionFilter = {}): Promise<Question[]> {
  const db = await getDb();
  if (!db) return filterMock(QUESTIONS, filter);
  let query = db.from('questions').select('content');
  if (filter.domain) query = query.eq('domain', filter.domain);
  if (filter.difficulty) query = query.eq('difficulty', filter.difficulty);
  const { data, error } = await query;
  if (error) throw error;
  return filterMock(
    (data ?? []).map((r) => r.content as Question),
    { desmosOnly: filter.desmosOnly, search: filter.search },
  );
}

export async function getQuestion(id: string): Promise<Question | null> {
  const db = await getDb();
  if (!db) return QUESTIONS.find((q) => q.id === id) ?? null;
  const { data, error } = await db.from('questions').select('content').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data?.content as Question) ?? null;
}

export async function getSaved(userId: string): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];
  const { data, error } = await db.from('saved_questions').select('question_id').eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.question_id as string);
}
