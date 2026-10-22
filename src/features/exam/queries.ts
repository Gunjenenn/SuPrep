import { getDb } from '@/lib/supabase/server';
import { QUESTIONS } from '@/mocks/questions';
import { EXAM_CONFIG, type ExamEvent, type ExamPhase } from './lib/exam-machine';

export type ExamModule = {
  no: 1 | 2;
  questionIds: string[];
  minutes: number;
};

export type Exam = {
  id: string;
  userId: string;
  startedAt: string | null;
  phase: ExamPhase;
  endsAt: string | null;
  module: number;
  modules: ExamModule[];
};

type ExamRow = {
  id: string;
  user_id: string;
  started_at: string | null;
  phase: ExamPhase;
  ends_at: string | null;
  module: number;
  modules: ExamModule[];
};

function toExam(row: ExamRow): Exam {
  return {
    id: row.id,
    userId: row.user_id,
    startedAt: row.started_at,
    phase: row.phase,
    endsAt: row.ends_at,
    module: row.module,
    modules: row.modules,
  };
}

function firstModule(): ExamModule {
  return {
    no: 1,
    questionIds: QUESTIONS.slice(0, EXAM_CONFIG.questionsPerModule).map((question) => question.id),
    minutes: EXAM_CONFIG.moduleMinutes,
  };
}

function demoExam(userId: string): Exam {
  return {
    id: `exam-${Date.now()}`,
    userId,
    startedAt: null,
    phase: 'intro',
    endsAt: null,
    module: 0,
    modules: [firstModule()],
  };
}

export async function createExam(userId = 'u-demo'): Promise<Exam> {
  const db = await getDb();

  if (!db) {
    return demoExam(userId);
  }

  const {
    data: { user },
    error: authError,
  } = await db.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required to create an exam');
  }

  const module1 = firstModule();

  if (module1.questionIds.length !== EXAM_CONFIG.questionsPerModule) {
    throw new Error('Not enough questions for Module 1');
  }

  const { data: examId, error: createError } = await db.rpc('create_exam', {
    p_question_ids: module1.questionIds,
  });

  if (createError) {
    throw createError;
  }

  if (typeof examId !== 'string') {
    throw new Error('Exam creation returned an invalid ID');
  }

  const exam = await getExam(examId);

  if (!exam) {
    throw new Error('Created exam could not be loaded');
  }

  return exam;
}

export async function getExam(id: string): Promise<Exam | null> {
  const db = await getDb();

  if (!db) {
    return null;
  }

  const { data, error } = await db
    .from('exams')
    .select('id, user_id, started_at, phase, ends_at, module, modules')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? toExam(data as ExamRow) : null;
}

export async function transitionExamOnServer(
  examId: string,
  event: ExamEvent,
  expectedPhase: ExamPhase,
): Promise<Exam> {
  const db = await getDb();

  if (!db) {
    throw new Error('Exam persistence requires Supabase');
  }

  const { data, error } = await db.rpc('transition_exam', {
    p_exam_id: examId,
    p_event: event,
    p_expected_phase: expectedPhase,
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Exam transition returned no data');
  }

  return toExam(data as ExamRow);
}
