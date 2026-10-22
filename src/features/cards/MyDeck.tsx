'use client';
import { useRouter } from 'next/navigation';
import { type FormEvent, useId, useState, useTransition } from 'react';
import { Rich } from '@/components/math/Rich';
import { useT } from '@/lib/i18n-client';
import type { Card } from '@/types';
import { addMyCard, deleteMyCard } from './actions';
import { TrashIcon } from './icons';
import { MyCardInput } from './lib/content';
import { btn, eyebrow, input, panel } from './ui';

type Field = 'front' | 'back' | 'hook' | 'ex';
const EMPTY: Record<Field, string> = { front: '', back: '', hook: '', ex: '' };
const FIELDS: Field[] = ['front', 'back', 'hook', 'ex'];

function CardRow({ card, onDelete }: { card: Card; onDelete: (id: string) => Promise<void> }) {
  const t = useT('cards');
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  return (
    <li className={`${panel} flex items-center gap-3 rounded-2xl px-5 py-4`}>
      <div className="min-w-0 flex-1">
        <div className="cd-display truncate font-black">{card.front}</div>
        <div className="mt-0.5 truncate text-sm text-(--cd-muted)">
          <Rich text={card.back} />
        </div>
      </div>
      {confirm ? (
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs font-bold text-(--cd-rose)">{t('mine.confirm')}</span>
          <button
            type="button"
            disabled={pending}
            onClick={() => start(() => onDelete(card.id))}
            className="rounded-lg bg-(--cd-rose) px-3 py-1.5 text-xs font-bold text-[#2a0b0b] disabled:opacity-50"
          >
            {t('mine.yes')}
          </button>
          <button
            type="button"
            onClick={() => setConfirm(false)}
            className="rounded-lg border border-(--cd-line) px-3 py-1.5 text-xs font-bold text-(--cd-muted)"
          >
            {t('mine.no')}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirm(true)}
          aria-label={t('mine.delete', { word: card.front })}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-(--cd-muted) transition hover:bg-[#1a2c22] hover:text-(--cd-rose)"
        >
          <TrashIcon />
        </button>
      )}
    </li>
  );
}

export function MyCardsManager({ cards }: { cards: Card[] }) {
  const t = useT('cards');
  const router = useRouter();
  const formId = useId();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSaved(false);
    const parsed = MyCardInput.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const i of parsed.error.issues) next[String(i.path[0])] ??= i.message;
      setErrors(next);
      return;
    }
    start(async () => {
      const res = await addMyCard(parsed.data);
      if (!res.ok) {
        setErrors(res.errors);
        return;
      }
      setForm(EMPTY);
      setErrors({});
      setSaved(true);
      router.refresh();
    });
  };

  const remove = async (id: string) => {
    if (await deleteMyCard(id)) router.refresh();
  };

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1.25fr_1fr]">
      <form onSubmit={submit} noValidate className={`${panel} grid gap-4 p-5 md:p-6`}>
        <div className={`${eyebrow} text-[#4ade80]`}>{t('mine.add')}</div>
        {FIELDS.map((f) => {
          const err = errors[f];
          const fieldId = `${formId}-${f}`;
          return (
            <div key={f} className="grid gap-1.5">
              <label htmlFor={fieldId} className="text-sm font-bold">
                {t(`mine.fields.${f}`)}
              </label>
              <input
                id={fieldId}
                name={f}
                value={form[f]}
                onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                placeholder={t(`mine.placeholders.${f}`)}
                aria-invalid={Boolean(err)}
                className={input}
              />
              {err && <span className="text-xs font-bold text-(--cd-rose)">{t(`mine.errors.${err}`)}</span>}
            </div>
          );
        })}
        {errors.form && <p className="text-sm font-bold text-(--cd-rose)">{t('mine.errors.save')}</p>}
        <button type="submit" disabled={pending} className={`${btn.primary} mt-1 w-full py-3`}>
          {t('mine.submit')}
        </button>
        {saved && (
          <p role="status" className="text-center text-sm font-bold text-[#4ade80]">
            {t('mine.saved')}
          </p>
        )}
      </form>

      {cards.length ? (
        <ul className="grid gap-3">
          {cards.map((c) => (
            <CardRow key={c.id} card={c} onDelete={remove} />
          ))}
        </ul>
      ) : (
        <div className={`${panel} rounded-2xl px-5 py-6 text-sm text-(--cd-muted)`}>{t('mine.empty')}</div>
      )}
    </div>
  );
}
