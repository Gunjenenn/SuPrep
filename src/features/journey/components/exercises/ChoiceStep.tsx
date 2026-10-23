'use client';

import { useState } from 'react';
import { Rich } from '@/components/math/Rich';
import type { Exercise } from '@/types';

type ChoiceExercise = Extract<Exercise, { kind: 'choice' }>;

type Props = {
  exercise: ChoiceExercise;
  onComplete: (complete: boolean) => void;
};

export function ChoiceStep({ exercise, onComplete }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);

  function choose(index: number) {
    if (solved) return;

    setSelected(index);

    if (index === exercise.answer) {
      setSolved(true);
      onComplete(true);
    }
  }

  return (
    <div className="mt-5 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {exercise.options.map((option, index) => {
          const isCorrect = solved && index === exercise.answer;
          const isWrong = selected === index && !solved;

          return (
            <button
              key={`${index}-${option}`}
              type="button"
              disabled={solved}
              onClick={() => choose(index)}
              className={`min-h-20 rounded-2xl border-2 p-4 text-left text-lg font-bold transition-all ${
                isCorrect
                  ? 'border-leaf bg-sage text-leaf-ink'
                  : isWrong
                    ? 'border-rose bg-paper text-ink'
                    : 'border-line bg-paper text-ink hover:border-leaf'
              }`}
            >
              <span className="mr-3 text-sm opacity-60">{String.fromCharCode(65 + index)}.</span>
              <Rich text={option} />
              {isCorrect && ' ✓'}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div aria-live="polite" className="rounded-2xl border border-line bg-paper-2 p-4">
          <p className="font-extrabold text-ink">{solved ? 'Зөв хариуллаа! 🎉' : 'Дахин оролдоорой!'}</p>
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
