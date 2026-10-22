'use client';
import { memo, useState } from 'react';
import { CatHead } from '@/components/brand';
import { Rich } from '@/components/math/Rich';
import { Tex } from '@/components/math/Tex';
import { useT } from '@/lib/i18n-client';
import type { Card } from '@/types';
import { CardArt } from './art/CardArt';
import { speak } from './lib/speech';
import { btn, CAT_VARS, input } from './ui';

const stop = { onPointerDown: (e: { stopPropagation: () => void }) => e.stopPropagation() };

function SpeakerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      aria-hidden
    >
      <path d="M11 5 6 9H3v6h3l5 4V5Z" strokeLinejoin="round" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" strokeLinecap="round" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      aria-hidden
    >
      <path d="m4 20 4-1 11-11-3-3L5 16l-1 4Z" strokeLinejoin="round" />
    </svg>
  );
}

export const CardFront = memo(function CardFront({ card, face }: { card: Card; face: string }) {
  const t = useT('cards');
  const spoken = card.tex ? card.back : card.front;
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative grid flex-1 place-items-center overflow-hidden rounded-2xl bg-(--cd-panel-2)">
        <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: face }} />
        <CardArt art={card.art} v={card.v} className="h-full max-h-56 w-full p-4 text-(--cd-text)" />
      </div>
      <div className="grid justify-items-center gap-2 text-center">
        <h2 className="cd-display text-3xl font-black leading-tight text-(--cd-text)">{card.front}</h2>
        {(card.ipa || card.say) && (
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            {card.ipa && <span className="font-mono text-(--cd-muted)">{card.ipa}</span>}
            {card.say && (
              <span className="rounded-full bg-(--cd-panel-2) px-2.5 py-0.5 font-semibold text-[#4ade80]">
                [{card.say}]
              </span>
            )}
          </div>
        )}
        {card.tex && <p className="text-sm font-semibold text-(--cd-muted)">{card.back}</p>}
        <button
          type="button"
          {...stop}
          onClick={(e) => {
            e.stopPropagation();
            speak(spoken, card.id);
          }}
          aria-label={t('face.listen')}
          className="mt-1 grid h-11 w-11 place-items-center rounded-full bg-(--cd-green) text-white shadow-[0_4px_0_#15803d] transition active:translate-y-1 active:shadow-none"
        >
          <SpeakerIcon />
        </button>
      </div>
      <p className="text-center text-xs font-semibold text-(--cd-muted)">{t('study.tapHint')}</p>
    </div>
  );
});

function NoteBox({
  hook,
  note,
  onSave,
}: {
  hook?: string;
  note?: string;
  onSave: (text: string) => Promise<boolean>;
}) {
  const t = useT('cards');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note ?? hook ?? '');
  const [busy, setBusy] = useState(false);
  const shown = note ?? hook;

  const save = async () => {
    setBusy(true);
    const ok = await onSave(draft);
    setBusy(false);
    if (ok) setEditing(false);
  };

  return (
    <div className="rounded-2xl bg-(--cd-panel-2) p-4" {...stop}>
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-(--cd-green)">
          <CatHead size={24} mood="wink" style={CAT_VARS} />
        </span>
        <span className="flex-1 cd-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#4ade80]">
          {note ? t('face.myNote') : t('face.hook')}
        </span>
        {!editing && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDraft(shown ?? '');
              setEditing(true);
            }}
            aria-label={t('face.edit')}
            className="grid h-8 w-8 place-items-center rounded-lg text-[#4ade80] transition hover:bg-(--cd-panel)"
          >
            <PencilIcon />
          </button>
        )}
      </div>
      {editing ? (
        <div className="mt-3 grid gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            maxLength={300}
            rows={3}
            placeholder={t('face.notePlaceholder')}
            aria-label={t('face.myNote')}
            className={`${input} resize-none`}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setEditing(false);
              }}
              className={`${btn.dark} py-2!`}
            >
              {t('face.cancel')}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={(e) => {
                e.stopPropagation();
                save();
              }}
              className={`${btn.primary} py-2!`}
            >
              {t('face.save')}
            </button>
          </div>
        </div>
      ) : shown ? (
        <p className="mt-2 text-sm leading-relaxed text-(--cd-text)">
          <Rich text={shown} />
        </p>
      ) : (
        <p className="mt-2 text-sm text-(--cd-muted)">{t('face.notePlaceholder')}</p>
      )}
    </div>
  );
}

export const CardBack = memo(function CardBack({
  card,
  note,
  onSaveNote,
}: {
  card: Card;
  note?: string;
  onSaveNote: (cardId: string, text: string) => Promise<boolean>;
}) {
  const t = useT('cards');
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto">
      <div className="text-center">
        {card.tex ? (
          <>
            <div className="cd-mono text-[11px] font-bold uppercase tracking-[0.18em] text-(--cd-muted)">
              {card.front}
            </div>
            <div className="mt-3 overflow-x-auto rounded-2xl bg-(--cd-panel-2) px-3 py-4 text-xl text-(--cd-text)">
              <Tex tex={card.tex} display />
            </div>
          </>
        ) : (
          <>
            <div className="cd-mono text-[11px] font-bold uppercase tracking-[0.18em] text-(--cd-muted)">
              {card.front}
            </div>
            <h2 className="mt-1 cd-display text-3xl font-black leading-tight text-(--cd-text)">
              {card.back}
            </h2>
          </>
        )}
      </div>
      {card.when && (
        <div>
          <div className="cd-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#4ade80]">
            {t('face.when')}
          </div>
          <p className="mt-1 text-sm text-(--cd-text)">
            <Rich text={card.when} />
          </p>
        </div>
      )}
      <NoteBox key={card.id} hook={card.hook} note={note} onSave={(text) => onSaveNote(card.id, text)} />
      {card.ex && (
        <div>
          <div className="cd-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#4ade80]">
            {t('face.example')}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-(--cd-text)">
            <Rich text={card.ex} />
          </p>
        </div>
      )}
    </div>
  );
});
