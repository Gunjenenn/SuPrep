export type ExamPhase = 'intro' | 'module1' | 'break' | 'module2' | 'results';

export type ExamEvent = 'START' | 'SUBMIT' | 'TIME_UP';

export const EXAM_CONFIG = {
  moduleMinutes: 35,
  breakMinutes: 10,
  questionsPerModule: 22,
} as const;

export type ExamState = {
  phase: ExamPhase;
  endsAt: string | null;
};

export function createInitialExamState(): ExamState {
  return {
    phase: 'intro',
    endsAt: null,
  };
}

function deadline(now: number, minutes: number): string {
  return new Date(now + minutes * 60_000).toISOString();
}

export function getRemainingSeconds(endsAt: string | null, now: number = Date.now()): number {
  if (!endsAt) return 0;

  const end = Date.parse(endsAt);

  if (!Number.isFinite(end)) return 0;

  return Math.max(0, Math.ceil((end - now) / 1000));
}

/**
 * Advances through all expired phases.
 * Original deadlines are preserved so offline time
 * does not extend the exam.
 */
export function recoverExam(state: ExamState, now: number = Date.now()): ExamState {
  let current = state;

  for (let i = 0; i < 3; i++) {
    if (current.phase === 'intro' || current.phase === 'results' || !current.endsAt) {
      break;
    }

    const end = Date.parse(current.endsAt);

    if (!Number.isFinite(end) || now < end) {
      break;
    }

    if (current.phase === 'module1') {
      current = {
        phase: 'break',
        endsAt: deadline(end, EXAM_CONFIG.breakMinutes),
      };
    } else if (current.phase === 'break') {
      current = {
        phase: 'module2',
        endsAt: deadline(end, EXAM_CONFIG.moduleMinutes),
      };
    } else if (current.phase === 'module2') {
      current = {
        phase: 'results',
        endsAt: null,
      };
    }
  }

  return current;
}

export function transitionExam(state: ExamState, event: ExamEvent, now: number = Date.now()): ExamState {
  const current = recoverExam(state, now);

  // Expired phases must not process a stale action.
  if (event !== 'TIME_UP' && current.phase !== state.phase) {
    return current;
  }

  if (event === 'TIME_UP') {
    return current;
  }

  switch (current.phase) {
    case 'intro':
      if (event === 'START') {
        return {
          phase: 'module1',
          endsAt: deadline(now, EXAM_CONFIG.moduleMinutes),
        };
      }
      return current;

    case 'module1':
      if (event === 'SUBMIT') {
        return {
          phase: 'break',
          endsAt: deadline(now, EXAM_CONFIG.breakMinutes),
        };
      }
      return current;

    case 'break':
      return current;

    case 'module2':
      if (event === 'SUBMIT') {
        return {
          phase: 'results',
          endsAt: null,
        };
      }
      return current;

    case 'results':
      return current;
  }
}
