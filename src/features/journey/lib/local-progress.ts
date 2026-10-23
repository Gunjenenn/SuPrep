import type { LessonProgress } from '../queries';

const STORAGE_KEY = 'suuprep:journey:progress:v1';

export function loadLocalProgress(): LessonProgress[] {
  if (typeof window === 'undefined') return [];

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is LessonProgress =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.lessonId === 'string' &&
        typeof item.done === 'boolean' &&
        typeof item.best === 'number' &&
        Number.isFinite(item.best),
    );
  } catch {
    return [];
  }
}

export function saveLocalProgress(lessonId: string, done: boolean, best: number): LessonProgress[] {
  const previous = loadLocalProgress();
  const existing = previous.find((item) => item.lessonId === lessonId);

  const updated: LessonProgress = {
    lessonId,
    done: (existing?.done ?? false) || done,
    best: Math.max(existing?.best ?? 0, best),
  };

  const next = [...previous.filter((item) => item.lessonId !== lessonId), updated];

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

  return next;
}
