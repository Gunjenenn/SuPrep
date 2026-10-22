export interface CardState {
  box: number;
  due_at: Date;
}

const MAX_BOX = 4;

const INTERVAL_DAYS: Record<number, number> = {
  1: 1,
  2: 3,
  3: 7,
  4: 14,
};

export function grade(state: CardState, knew: boolean, now: Date = new Date()): CardState {
  if (!knew) {
    return { box: 1, due_at: now };
  }

  const nextBox = Math.min(state.box + 1, MAX_BOX);
  const days = INTERVAL_DAYS[nextBox] ?? INTERVAL_DAYS[MAX_BOX];
  const due_at = new Date(now.getTime() + days * 86_400_000);

  return { box: nextBox, due_at };
}

export function statusOf(box: number): 'шинэ' | 'сурч буй' | 'цээжилсэн' {
  if (box <= 1) return 'шинэ';
  if (box === 2) return 'сурч буй';
  return 'цээжилсэн';
}
