'use client';

import { useState } from 'react';
import { Rich } from '@/components/math/Rich';
import type { Exercise } from '@/types';

type BuildExercise = Extract<Exercise, { kind: 'build' }>;

type Props = {
  exercise: BuildExercise;
  onComplete: (complete: boolean) => void;
};

export function BuildStep({ exercise, onComplete }: Props) {
  const [selected, setSelected] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const answer = selected.map((index) => exercise.tokens[index]);
  const correct =
    answer.length === exercise.answer.length &&
    answer.every((token, index) => token === exercise.answer[index]);

  function addToken(index: number) {
    if (solved || selected.includes(index)) return;
    setSelected((previous) => [...previous, index]);
    setChecked(false);
  }

  function removeToken(index: number) {
    if (solved) return;
    setSelected((previous) => previous.filter((_, i) => i !== index));
    setChecked(false);
  }

  function checkAnswer() {
    setChecked(true);

    if (correct) {
      setSolved(true);
      onComplete(true);
    }
  }

  return (
    <div className="mt-5 space-y-5">
      <div className="rounded-2xl bg-paper-2 p-5">
        <p className="mb-2 text-xs font-bold text-ink-3">Англи өгүүлбэр</p>
        <div className="text-lg font-bold text-ink">
          <Rich text={exercise.sentence} />
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-bold text-ink-2">Чиний бүтээсэн илэрхийлэл</p>
        <div className="flex min-h-20 flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-line bg-paper p-3">
          {selected.length === 0 ? (
            <p className="text-sm text-ink-3">Доорх тэмдэглэгээнүүдээс сонгоорой</p>
          ) : (
            selected.map((tokenIndex, index) => (
              <button
                key={tokenIndex}
                type="button"
                disabled={solved}
                onClick={() => removeToken(index)}
                className="rounded-xl border border-line bg-paper-2 px-4 py-3 text-lg font-bold text-ink"
              >
                {exercise.tokens[tokenIndex]}
              </button>
            ))
          )}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-bold text-ink-2">Тэмдэглэгээнүүд</p>
        <div className="flex flex-wrap gap-2">
          {exercise.tokens.map((token, index) => (
            <button
              key={`${token}-${index}`}
              type="button"
              disabled={solved || selected.includes(index)}
              onClick={() => addToken(index)}
              className="min-w-14 rounded-xl border-2 border-line bg-paper px-4 py-3 text-lg font-bold text-ink transition-all hover:border-leaf disabled:cursor-not-allowed disabled:opacity-30"
            >
              {token}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={selected.length === 0 || solved}
          onClick={() => {
            setSelected([]);
            setChecked(false);
          }}
          className="rounded-xl border border-line px-5 py-3 text-sm font-bold text-ink disabled:opacity-40"
        >
          Цэвэрлэх
        </button>

        <button
          type="button"
          disabled={selected.length === 0 || solved}
          onClick={checkAnswer}
          className="rounded-xl bg-leaf px-6 py-3 text-sm font-bold text-white disabled:opacity-40"
        >
          Хариу шалгах
        </button>
      </div>

      {checked && (
        <div aria-live="polite" className="rounded-2xl border border-line bg-paper-2 p-4">
          <p className="font-extrabold text-ink">
            {solved ? 'Зөв бүтээлээ! 🎉' : 'Дарааллаа дахин шалгаарай.'}
          </p>
          {solved && (
            <div className="mt-2 text-sm leading-7 text-ink-2">
              <Rich text={exercise.explain} />
            </div>
          )}
        </div>
      )}

      {!solved && exercise.hint && (
        <div>
          <button
            type="button"
            onClick={() => setShowHint((value) => !value)}
            className="text-sm font-bold text-leaf underline"
          >
            {showHint ? 'Санамж нуух' : '💡 Санамж авах'}
          </button>

          {showHint && (
            <div className="mt-3 rounded-xl bg-paper-2 p-4 text-sm text-ink-2">
              <Rich text={exercise.hint} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
