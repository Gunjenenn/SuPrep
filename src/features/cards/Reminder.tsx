'use client';
import { useEffect, useId, useState } from 'react';
import { useT } from '@/lib/i18n-client';
import { BellIcon } from './icons';

export const REMINDER_KEY = 'suprep-card-reminder';

type Reminder = { on: boolean; time: string };

const DEFAULT: Reminder = { on: false, time: '20:00' };

function read(): Reminder {
  try {
    const v = JSON.parse(localStorage.getItem(REMINDER_KEY) ?? 'null');
    if (v && typeof v.on === 'boolean' && /^\d{2}:\d{2}$/.test(v.time)) return v;
  } catch {}
  return DEFAULT;
}

export function ReminderRow() {
  const t = useT('cards');
  const id = useId();
  const [r, setR] = useState<Reminder>(DEFAULT);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setR(read());
    setReady(true);
  }, []);

  const update = (next: Reminder) => {
    setR(next);
    try {
      localStorage.setItem(REMINDER_KEY, JSON.stringify(next));
    } catch {}
  };

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-(--cd-line) bg-[#0a1610] px-4 py-3">
        <BellIcon className="h-4 w-4 shrink-0 text-(--cd-green)" />
        <label htmlFor={id} className="min-w-0 flex-1 text-sm font-bold">
          {t('reminder.title')}
        </label>
        <input
          id={id}
          type="time"
          value={r.time}
          disabled={!r.on}
          onChange={(e) => e.target.value && update({ ...r, time: e.target.value })}
          className="cd-mono rounded-xl border border-(--cd-line) bg-(--cd-panel) px-3 py-2 text-sm font-bold text-(--cd-text) outline-none scheme-dark focus:border-[#22c55e] disabled:opacity-50"
        />
        <button
          type="button"
          role="switch"
          aria-checked={r.on}
          aria-label={t('reminder.title')}
          disabled={!ready}
          onClick={() => update({ ...r, on: !r.on })}
          className={`relative h-8 w-14 shrink-0 rounded-full transition-colors disabled:opacity-40 ${r.on ? 'bg-(--cd-green)' : 'bg-[#1f3328]'}`}
        >
          <span
            aria-hidden
            className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${r.on ? 'translate-x-6' : ''}`}
          />
        </button>
      </div>
      <p className="px-1 text-xs text-(--cd-muted)">{t('reminder.note')}</p>
    </div>
  );
}
