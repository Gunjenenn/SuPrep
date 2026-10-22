import { DAY_MS, dayKey } from '@/lib/time';
import type { CardState } from '@/types';

export type CardStatus = 'new' | 'learning' | 'mastered';

export const MAX_BOX = 4;
export const INTERVAL_DAYS = [0, 1, 3, 7, 14];

export function freshState(now: number): CardState {
  return { box: 0, due: now, seen: 0, ok: 0 };
}

export function grade(state: CardState, knew: boolean, now: number = Date.now()): CardState {
  const seen = state.seen + 1;
  if (!knew) return { box: 1, due: now, seen, ok: state.ok };
  const box = Math.min(state.box + 1, MAX_BOX);
  return { box, due: now + INTERVAL_DAYS[box] * DAY_MS, seen, ok: state.ok + 1 };
}

export function statusOf(box: number): CardStatus {
  if (box <= 1) return 'new';
  if (box === 2) return 'learning';
  return 'mastered';
}

export function reviewDay(due: number, now: number = Date.now()): 'today' | 'tomorrow' | 'later' {
  const d = dayKey(due);
  if (d <= dayKey(now)) return 'today';
  if (d === dayKey(now + DAY_MS)) return 'tomorrow';
  return 'later';
}
