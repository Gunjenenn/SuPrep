import { expect, test } from 'bun:test';
import { DESMOS_AI_LESSONS, findLesson } from './desmos-lessons';

test('six lessons, each with steps, a check and an answer', () => {
  expect(DESMOS_AI_LESSONS).toHaveLength(6);
  for (const l of DESMOS_AI_LESSONS) {
    expect(l.steps.length).toBeGreaterThan(1);
    expect(l.answer).not.toBe('');
    expect(l.check).toContain('✓');
    for (const s of l.steps)
      for (const it of s.desmos) expect(Boolean(it.latex || it.type === 'table')).toBe(true);
  }
});

test('finds a lesson from its own question and from typed variants', () => {
  for (const l of DESMOS_AI_LESSONS) expect(findLesson(l.question)?.id).toBe(l.id);
  expect(findLesson('3x+5=20 бол x?')?.id).toBe('intersection');
  expect(findLesson('k-ийн ямар утгад шийдгүй вэ')?.id).toBe('slider');
  expect(findLesson('Пифагор')).toBeNull();
  expect(findLesson('   ')).toBeNull();
});
