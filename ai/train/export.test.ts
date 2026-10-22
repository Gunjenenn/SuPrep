import { describe, expect, test } from 'bun:test';
import { QUESTIONS } from '../../src/mocks/questions';
import { answerText, buildDataset, examplesFor, split } from './export';

const d = buildDataset();
const reply = (ex: { messages: { role: string; content: string }[] }) => ex.messages.at(-1)?.content ?? '';

describe('tuning export', () => {
  test('every hand-written question gives at least 6 examples', () => {
    for (const q of QUESTIONS) expect(examplesFor(q, { rich: true }).length).toBeGreaterThanOrEqual(6);
  });

  test('dataset is big enough and has every conversation type', () => {
    expect(d.train.length).toBeGreaterThan(2000);
    const modes = new Set(d.train.map((x) => x.mode));
    for (const m of ['hint', 'explain', 'multi', 'wrong', 'check', 'similar', 'translate', 'general'])
      expect(modes.has(m as never)).toBe(true);
  });

  test('explain replies end with the correct final answer', () => {
    for (const q of QUESTIONS) {
      for (const ex of examplesFor(q, { rich: true }).filter((e) => e.mode === 'explain')) {
        expect(reply(ex).endsWith(`Хариу: ${answerText(q)}`)).toBe(true);
      }
    }
  });

  test('hint and wrong-answer replies never say "Хариу:" and wrong replies never say "Зөв!"', () => {
    for (const ex of d.train.filter((e) => e.mode === 'hint' || e.mode === 'wrong')) {
      expect(reply(ex).includes('Хариу:')).toBe(false);
    }
    for (const ex of d.train.filter((e) => e.mode === 'wrong'))
      expect(reply(ex).startsWith('Зөв')).toBe(false);
  });

  test('no question appears in more than one split', () => {
    const { train, val } = split(QUESTIONS);
    expect(train.length + val.length).toBe(QUESTIONS.length);
    const s = d.splits;
    const trainP = new Set([...s.origTrain, ...s.genTrain].map((q) => q.prompt));
    for (const q of [...s.origVal, ...s.genVal, ...s.genEval]) expect(trainP.has(q.prompt)).toBe(false);
    const valIds = new Set(d.val.map((x) => x.questionId));
    for (const x of d.train) if (!x.mode.startsWith('general')) expect(valIds.has(x.questionId)).toBe(false);
  });

  test('eval covers held-out hand-written and generated questions', () => {
    expect(d.eval.some((e) => e.source === 'original')).toBe(true);
    expect(d.eval.some((e) => e.source === 'generated')).toBe(true);
  });
});
