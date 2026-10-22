// Section B · Desmos lessons are content files (no tables). Today they come from src/mocks;
// B6 moves them to src/features/desmos/content/*.json.
import { DESMOS } from '@/mocks/desmos';
import { HACKS } from '@/mocks/meta';
import type { DesmosHack, DesmosLesson } from '@/types';

export async function listDesmosLessons(): Promise<DesmosLesson[]> {
  return [...DESMOS].sort((a, b) => a.no - b.no);
}

export async function getDesmosLesson(id: string): Promise<DesmosLesson | null> {
  return DESMOS.find((d) => d.id === id) ?? null;
}

export async function listHacks(): Promise<DesmosHack[]> {
  return HACKS;
}
