import { STAGES } from '@/mocks/stages';
import type { Lesson, NodeStatus, Stage } from '@/types';
import type { LessonProgress } from '../queries';

const CHECKPOINT_PASS_SCORE = 4;

type Progress = readonly LessonProgress[];

function passed(progress: Progress, node: Lesson): boolean {
  const record = progress.find((p) => p.lessonId === node.id);

  if (!record?.done) return false;

  if (node.kind === 'checkpoint') {
    return record.best >= CHECKPOINT_PASS_SCORE;
  }

  return true;
}

function stageUnlocked(progress: Progress, stage: Stage): boolean {
  if (stage.alwaysOpen || stage.no === 1) {
    return true;
  }

  if (stage.no === 2) {
    const checkpoint = STAGES[0].nodes.find((node) => node.kind === 'checkpoint');

    return checkpoint ? passed(progress, checkpoint) : false;
  }

  if (stage.no === 3) {
    return true;
  }

  if (stage.no === 4) {
    const checkpoint = STAGES[1].nodes.find((node) => node.kind === 'checkpoint');

    return checkpoint ? passed(progress, checkpoint) : false;
  }

  if (stage.no === 5) {
    const previous = STAGES.find((s) => s.no === 4);

    return previous ? previous.nodes.every((node) => passed(progress, node)) : false;
  }

  return false;
}

/**
 * Returns the availability of a journey node.
 *
 * done    - successfully completed
 * current - next required step
 * open    - available optional step
 * locked  - prerequisites not completed
 */
export function nodeStatus(progress: Progress, node: Lesson): NodeStatus {
  const stage = STAGES.find((s) => s.nodes.some((n) => n.id === node.id));

  if (!stage) return 'locked';

  if (passed(progress, node)) {
    return 'done';
  }

  if (!stageUnlocked(progress, stage)) {
    return 'locked';
  }

  if (stage.alwaysOpen) {
    return 'open';
  }

  const index = stage.nodes.findIndex((n) => n.id === node.id);

  if (index === -1) return 'locked';

  const previousNodes = stage.nodes.slice(0, index);

  const prerequisitesCompleted = previousNodes.every((previous) => passed(progress, previous));

  return prerequisitesCompleted ? 'current' : 'locked';
}

/**
 * Finds the next unfinished lesson in the main journey.
 * Optional Desmos nodes do not interrupt the sequence.
 */
export function nextLesson(progress: Progress): Lesson | null {
  const stages = [...STAGES].filter((stage) => !stage.alwaysOpen).sort((a, b) => a.no - b.no);

  for (const stage of stages) {
    if (!stageUnlocked(progress, stage)) {
      continue;
    }

    for (const node of stage.nodes) {
      if (nodeStatus(progress, node) === 'current') {
        return node;
      }
    }
  }

  return null;
}
