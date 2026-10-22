import { describe, expect, test } from 'bun:test';
import { createTimedSession, finishTimedSession, formatTime, tickTimedSession } from './timed-session';

describe('timed practice session', () => {
  test('starts with 5 questions and 6 minutes', () => {
    const session = createTimedSession();

    expect(session.totalQuestions).toBe(5);
    expect(session.remainingSeconds).toBe(360);
    expect(session.status).toBe('running');
  });

  test('finishes automatically when the timer reaches zero', () => {
    let session = createTimedSession();

    for (let i = 0; i < 360; i += 1) {
      session = tickTimedSession(session);
    }

    expect(session.remainingSeconds).toBe(0);
    expect(session.status).toBe('finished');
  });

  test('does not tick or finish again after completion', () => {
    let session = createTimedSession();

    for (let i = 0; i < 360; i += 1) {
      session = tickTimedSession(session);
    }

    const finishedSession = session;
    session = tickTimedSession(session);

    expect(session).toBe(finishedSession);
    expect(finishTimedSession(session)).toBe(finishedSession);
  });

  test('formats the countdown', () => {
    expect(formatTime(360)).toBe('06:00');
    expect(formatTime(65)).toBe('01:05');
    expect(formatTime(0)).toBe('00:00');
  });
});
