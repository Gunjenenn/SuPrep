'use client';
import { type ReactNode, useEffect, useState } from 'react';
import { Icon } from '@/components/shell/icons';
import { useT } from '@/lib/i18n-client';

const KEY = 'suprep-scores';
type Scores = { current: number | null; target: number };

const valid = (n: number) => Number.isInteger(n) && n >= 200 && n <= 800;

/** Current and target SAT Math score; the student edits both (kept in this browser). */
export function ScoreCard({ target }: { target: number }) {
  const t = useT('home');
  const [s, setS] = useState<Scores>({ current: null, target });
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setS((p) => ({ ...p, ...(JSON.parse(raw) as Partial<Scores>) }));
    } catch {
      // nothing saved or storage blocked
    }
    const open = () => {
      if (window.location.hash === '#scores') setEditing(true);
    };
    open();
    window.addEventListener('hashchange', open);
    return () => window.removeEventListener('hashchange', open);
  }, []);

  let body: ReactNode;
  if (editing) {
    body = (
      <form
        className="soft-card p-5 grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const cur = String(f.get('current') ?? '').trim();
          const tgt = Number(f.get('target'));
          const next: Scores = { current: cur ? Number(cur) : null, target: tgt };
          if ((next.current !== null && !valid(next.current)) || !valid(next.target)) {
            setError(true);
            return;
          }
          setError(false);
          setS(next);
          setEditing(false);
          try {
            localStorage.setItem(KEY, JSON.stringify(next));
          } catch {
            // keep for this visit only
          }
          if (window.location.hash === '#scores') history.replaceState(null, '', window.location.pathname);
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          {(['current', 'target'] as const).map((k) => (
            <label key={k} className="grid gap-1.5 text-[13px] font-semibold text-ink-2">
              {t(`dashboard.scores.${k}`)}
              <input
                name={k}
                type="number"
                inputMode="numeric"
                min={200}
                max={800}
                step={10}
                defaultValue={s[k] ?? ''}
                placeholder="200–800"
                className="h-11 px-3 rounded-xl border border-line bg-paper-2 text-[18px] font-bold text-ink tnum"
              />
            </label>
          ))}
        </div>
        <p className={`text-[12.5px] ${error ? 'text-danger font-semibold' : 'text-ink-3'}`}>
          {t(error ? 'dashboard.scores.range' : 'dashboard.scores.hint')}
        </p>
        <button type="submit" className="h-10 rounded-xl bg-leaf text-[var(--c-on-leaf)] font-bold">
          {t('dashboard.scores.save')}
        </button>
      </form>
    );
  } else {
    body = (
      <section className="soft-card grid grid-cols-2 divide-x divide-line overflow-hidden">
        {(['current', 'target'] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setEditing(true)}
            className="p-5 text-left hover:bg-paper-2 transition-colors"
            aria-label={`${t(`dashboard.scores.${k}`)} — ${t('dashboard.scores.edit')}`}
          >
            <span
              className={`block font-display font-bold text-[30px] leading-none tnum ${k === 'target' ? 'text-leaf-2' : 'text-ink'}`}
            >
              {s[k] ?? t('dashboard.scores.empty')}
            </span>
            <span className="mt-2 flex items-center gap-1.5 text-[13.5px] text-ink-2">
              {t(`dashboard.scores.${k}`)}
              <Icon name="practicePlayer" size={14} className="text-ink-3" />
            </span>
          </button>
        ))}
      </section>
    );
  }

  return (
    // biome-ignore lint/correctness/useUniqueElementIds: rendered once on the home page; #scores is the banner's link target
    <div id="scores" className="scroll-mt-28">
      {body}
    </div>
  );
}
