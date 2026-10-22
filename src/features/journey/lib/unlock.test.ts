import { describe, expect, test } from 'bun:test';
import { STAGES } from '@/mocks/stages';
import type { LessonProgress } from '../queries';
import { nextLesson, nodeStatus } from './unlock';

const progress = (lessonId: string, done = true, best = 0): LessonProgress => ({
  lessonId,
  done,
  best,
});

describe('Journey unlock rules', () => {
  const stage1 = STAGES[0];
  const stage2 = STAGES[1];
  const desmos = STAGES[2];

  test('new student starts at the first lesson', () => {
    const empty: LessonProgress[] = [];

    expect(nodeStatus(empty, stage1.nodes[0])).toBe('current');
    expect(nodeStatus(empty, stage1.nodes[1])).toBe('locked');
    expect(nodeStatus(empty, stage2.nodes[0])).toBe('locked');
    expect(nextLesson(empty)?.id).toBe('s1-l1');
  });

  test('passing checkpoint unlocks stage 2', () => {
    const completed = [progress('s1-l1'), progress('s1-l2'), progress('s1-l3'), progress('s1-cp', true, 4)];

    expect(nodeStatus(completed, stage1.nodes[3])).toBe('done');
    expect(nodeStatus(completed, stage2.nodes[0])).toBe('current');
    expect(nextLesson(completed)?.id).toBe('s2-l1');
  });

  test('failing checkpoint keeps stage 2 locked', () => {
    const failed = [progress('s1-l1'), progress('s1-l2'), progress('s1-l3'), progress('s1-cp', true, 3)];

    expect(nodeStatus(failed, stage1.nodes[3])).toBe('current');
    expect(nodeStatus(failed, stage2.nodes[0])).toBe('locked');
    expect(nextLesson(failed)?.id).toBe('s1-cp');
  });

  test('Desmos stays open independently', () => {
    const empty: LessonProgress[] = [];

    expect(nodeStatus(empty, desmos.nodes[0])).toBe('open');
    expect(nodeStatus(empty, stage2.nodes[0])).toBe('locked');
  });

  test('checkpoint stays locked until all lessons are completed', () => {
    const incomplete = [progress('s1-l1'), progress('s1-l2')];

    expect(nodeStatus(incomplete, stage1.nodes[3])).toBe('locked');
    expect(nextLesson(incomplete)?.id).toBe('s1-l3');
  });

  test('checkpoint passes with a perfect score', () => {
    const completed = [progress('s1-l1'), progress('s1-l2'), progress('s1-l3'), progress('s1-cp', true, 5)];

    expect(nodeStatus(completed, stage1.nodes[3])).toBe('done');
    expect(nodeStatus(completed, stage2.nodes[0])).toBe('current');
  });

  test('completed lessons retain their done status', () => {
    const completed = [progress('s1-l1')];

    expect(nodeStatus(completed, stage1.nodes[0])).toBe('done');
    expect(nodeStatus(completed, stage1.nodes[1])).toBe('current');
    expect(nextLesson(completed)?.id).toBe('s1-l2');
  });

  test('checkpoint cannot pass without completion', () => {
    const incomplete = [progress('s1-l1'), progress('s1-l2'), progress('s1-l3'), progress('s1-cp', false, 5)];

    expect(nodeStatus(incomplete, stage1.nodes[3])).toBe('current');
    expect(nodeStatus(incomplete, stage2.nodes[0])).toBe('locked');
  });
});
