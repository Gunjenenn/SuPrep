export type Session = {
  queue: string[];
  requeued: string[];
  knew: string[];
  again: string[];
};

export function createSession(ids: string[]): Session {
  return { queue: [...new Set(ids)], requeued: [], knew: [], again: [] };
}

export function current(s: Session): string | undefined {
  return s.queue[0];
}

export function answer(s: Session, knew: boolean): Session {
  const [id, ...rest] = s.queue;
  if (id === undefined) return s;
  if (knew) return { ...s, queue: rest, knew: [...s.knew, id] };
  const again = s.again.includes(id) ? s.again : [...s.again, id];
  if (s.requeued.includes(id)) return { ...s, queue: rest, again };
  return { queue: [...rest, id], requeued: [...s.requeued, id], knew: s.knew, again };
}

export function isDone(s: Session): boolean {
  return s.queue.length === 0;
}

export function progress(s: Session): { done: number; total: number } {
  const total = new Set([...s.queue, ...s.knew, ...s.again]).size + s.requeued.length;
  return { done: total - s.queue.length, total };
}

export function tally(s: Session): { knew: number; again: number } {
  return { knew: s.knew.filter((id) => !s.again.includes(id)).length, again: s.again.length };
}
