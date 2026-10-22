export const TIMED_QUESTION_COUNT = 5;
export const TIMED_DURATION_SECONDS = 6 * 60;

export type TimedSessionStatus = 'running' | 'finished';

export type TimedSession = {
  status: TimedSessionStatus;
  remainingSeconds: number;
  totalQuestions: number;
  correctAnswers: number;
};

export function createTimedSession(): TimedSession {
  return {
    status: 'running',
    remainingSeconds: TIMED_DURATION_SECONDS,
    totalQuestions: TIMED_QUESTION_COUNT,
    correctAnswers: 0,
  };
}

export function tickTimedSession(session: TimedSession): TimedSession {
  if (session.status === 'finished') {
    return session;
  }

  const remainingSeconds = Math.max(0, session.remainingSeconds - 1);

  return {
    ...session,
    remainingSeconds,
    status: remainingSeconds === 0 ? 'finished' : 'running',
  };
}

export function finishTimedSession(session: TimedSession): TimedSession {
  if (session.status === 'finished') {
    return session;
  }

  return {
    ...session,
    status: 'finished',
  };
}

export function formatTime(seconds: number): string {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}
