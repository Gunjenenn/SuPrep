import type { Card, CardState } from '@/types';

export type DemoUser = {
  states: Record<string, CardState>;
  notes: Record<string, string>;
  mine: Card[];
};

type Store = Map<string, DemoUser>;

const g = globalThis as typeof globalThis & { __suprepCards?: Store };
const store: Store = g.__suprepCards ?? new Map();
g.__suprepCards = store;

export function demoUser(userId: string): DemoUser {
  let u = store.get(userId);
  if (!u) {
    u = { states: {}, notes: {}, mine: [] };
    store.set(userId, u);
  }
  return u;
}
