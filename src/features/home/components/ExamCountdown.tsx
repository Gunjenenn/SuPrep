'use client';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/shell/icons';
import { useT } from '@/lib/i18n-client';

const KEY = 'suprep-exam-date';

function readSaved(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** Minutes until 08:00 Ulaanbaatar time (UTC+8) on the exam day. */
function left(date: string, now: number) {
  const ms = Date.parse(`${date}T08:00:00+08:00`) - now;
  if (!Number.isFinite(ms) || ms <= 0) return null;
  const mins = Math.floor(ms / 60000);
  return { d: Math.floor(mins / 1440), h: Math.floor((mins % 1440) / 60), m: mins % 60 };
}

export function ExamCountdown({ examDate }: { examDate: string }) {
  const t = useT('home');
  const [date, setDate] = useState(examDate);
  const [now, setNow] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const saved = readSaved();
    if (saved) setDate(saved);
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const save = (v: string) => {
    if (!v) return;
    setDate(v);
    setEditing(false);
    try {
      localStorage.setItem(KEY, v);
    } catch {
      // storage blocked: keep the date for this visit only
    }
  };

  const l = now === null ? null : left(date, now);
  const tiles = [
    { v: l?.d, k: 'days' },
    { v: l?.h, k: 'hrs' },
    { v: l?.m, k: 'min' },
  ];

  return (
    <section className="soft-card p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold text-[18px] text-ink">{t('dashboard.countdown.title')}</h2>
        {editing ? (
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              save(String(new FormData(e.currentTarget).get('date') ?? ''));
            }}
          >
            <input
              name="date"
              type="date"
              defaultValue={date}
              aria-label={t('dashboard.countdown.edit')}
              className="h-9 px-2 rounded-xl border border-line bg-paper-2 text-[14px]"
            />
            <button
              type="submit"
              className="h-9 px-3 rounded-xl bg-leaf text-[var(--c-on-leaf)] text-[13px] font-bold"
            >
              {t('dashboard.countdown.save')}
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-[14px] font-semibold text-leaf-2 hover:underline tnum"
            aria-label={t('dashboard.countdown.edit')}
          >
            {date.replaceAll('-', '.')}
            <Icon name="practicePlayer" size={15} />
          </button>
        )}
      </div>
      {now !== null && !l ? (
        <p className="mt-4 text-[14px] text-ink-2">{t('dashboard.countdown.passed')}</p>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {tiles.map((x) => (
            <div key={x.k} className="rounded-2xl bg-paper-2 py-3 grid justify-items-center">
              <span className="font-display font-bold text-[26px] leading-none text-ink tnum">
                {x.v ?? '··'}
              </span>
              <span className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-3">
                {t(`dashboard.countdown.${x.k}`)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
