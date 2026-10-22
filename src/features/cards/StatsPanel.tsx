'use client';
import { CountUp } from '@/components/ui/CountUp';
import { useT } from '@/lib/i18n-client';
import type { CardStatus, StatusCounts } from './deck-hub';
import { ReminderRow } from './Reminder';
import { panel } from './ui';

const STATS: { key: CardStatus; tone: string }[] = [
  { key: 'new', tone: 'text-[#a7b8ae]' },
  { key: 'learning', tone: 'text-(--cd-amber)' },
  { key: 'mastered', tone: 'text-(--cd-green)' },
];

export function StatsPanel({ counts }: { counts: StatusCounts }) {
  const t = useT('cards');
  return (
    <section className={`${panel} grid content-between gap-5 p-5 md:p-6`}>
      <div className="grid grid-cols-3 text-center">
        {STATS.map((s) => (
          <div key={s.key}>
            <div className={`cd-display text-4xl font-black leading-none ${s.tone}`}>
              <CountUp value={counts[s.key]} />
            </div>
            <div className="mt-2 text-sm font-semibold text-(--cd-muted)">{t(`hub.stats.${s.key}`)}</div>
          </div>
        ))}
      </div>
      <ReminderRow />
    </section>
  );
}
