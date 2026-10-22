// All day boundaries (streaks, quests, reviews) use Mongolia time.
export const TZ = 'Asia/Ulaanbaatar';

/** YYYY-MM-DD for the given instant in Asia/Ulaanbaatar. */
export function dayKey(at: Date | number = Date.now()): string {
  const d = typeof at === 'number' ? new Date(at) : at;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

export const DAY_MS = 86_400_000;
