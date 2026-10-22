import { expect, test } from 'bun:test';
import { getDesmosLesson, listDesmosLessons, listHacks } from './queries';

test('9 lessons in order, 5 hacks', async () => {
  const lessons = await listDesmosLessons();
  expect(lessons).toHaveLength(9);
  expect(lessons.map((l) => l.no)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  expect((await getDesmosLesson('d3'))?.id).toBe('d3');
  expect(await getDesmosLesson('zz')).toBeNull();
  expect(await listHacks()).toHaveLength(5);
});
