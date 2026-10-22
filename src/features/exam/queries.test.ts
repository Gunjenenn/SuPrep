import { expect, test } from 'bun:test';
import { createExam, getExam } from './queries';

test('mock exam has a 22-question, 35-minute first module', async () => {
  const e = await createExam();
  expect(e.modules[0]).toMatchObject({ no: 1, minutes: 35 });
  expect(e.modules[0].questionIds).toHaveLength(22);
  expect(await getExam(e.id)).toBeNull();
});
