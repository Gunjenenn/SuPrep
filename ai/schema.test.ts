import { describe, expect, test } from 'bun:test';
import sources from './data/sources.json';
import { Dialogue, Source, SourceQuestion, TuningExample } from './schema';

describe('ai schema', () => {
  test('sources.json is valid and College Board starts disallowed', () => {
    const list = sources.map((s) => Source.parse(s));
    expect(list.find((s) => s.id === 'cb-question-bank')?.allowed).toBe(false);
  });

  test('SourceQuestion accepts MCQ and grid-in, rejects empty prompt', () => {
    const base = {
      id: 'a2',
      source: 'suuprep-original',
      domain: 'alg',
      skill: 's',
      difficulty: 1,
      explain: 'e',
    } as const;
    expect(SourceQuestion.safeParse({ ...base, prompt: 'p', choices: ['1', '2'], answer: 1 }).success).toBe(
      true,
    );
    expect(SourceQuestion.safeParse({ ...base, prompt: 'p', answer: ['37.5'] }).success).toBe(true);
    expect(SourceQuestion.safeParse({ ...base, prompt: '', answer: 1 }).success).toBe(false);
  });

  test('Dialogue needs at least two turns', () => {
    expect(
      Dialogue.safeParse({ questionId: 'a2', mode: 'hint', turns: [{ role: 'user', text: 'тусла' }] })
        .success,
    ).toBe(false);
  });

  test('TuningExample matches the Vertex AI shape', () => {
    const ex: TuningExample = {
      systemInstruction: { role: 'system', parts: [{ text: 'Чи бол Суу.' }] },
      contents: [
        { role: 'user', parts: [{ text: 'Сэжүүр өгөөч' }] },
        { role: 'model', parts: [{ text: 'Хоёр y-ийг тэнцүүл.' }] },
      ],
    };
    expect(TuningExample.parse(ex)).toEqual(ex);
  });
});
