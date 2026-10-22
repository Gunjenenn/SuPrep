import { describe, expect, test } from 'bun:test';
import { QUESTIONS } from '../../src/mocks/questions';
import { answerText, evalItems, examplesFor, split } from './export';

describe('tuning export', () => {
  test('every question gives at least 4 examples', () => {
    for (const q of QUESTIONS) expect(examplesFor(q).length).toBeGreaterThanOrEqual(4);
  });

  test('explain answers end with the correct final answer', () => {
    for (const q of QUESTIONS) {
      for (const ex of examplesFor(q).filter((e) => e.mode === 'explain')) {
        expect(ex.messages[2]?.content.endsWith(`Хариу: ${answerText(q)}`)).toBe(true);
      }
    }
  });

  test('hint answers do not say "Хариу:"', () => {
    for (const q of QUESTIONS) {
      for (const ex of examplesFor(q).filter((e) => e.mode === 'hint')) {
        expect(ex.messages[2]?.content.includes('Хариу:')).toBe(false);
      }
    }
  });

  test('no question is in both train and val', () => {
    const { train, val } = split(QUESTIONS);
    const trainIds = new Set(train.map((q) => q.id));
    expect(val.length).toBeGreaterThan(0);
    for (const q of val) expect(trainIds.has(q.id)).toBe(false);
    expect(train.length + val.length).toBe(QUESTIONS.length);
  });

  test('eval items only use val questions', () => {
    const { val } = split(QUESTIONS);
    const valIds = new Set(val.map((q) => q.id));
    for (const item of evalItems(val)) expect(valIds.has(item.questionId)).toBe(true);
  });
});
