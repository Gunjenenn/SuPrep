'use client';

import { useMemo, useState } from 'react';
import { Rich } from '@/components/math/Rich';
import type { Exercise } from '@/types';

type MatchExercise = Extract<Exercise, { kind: 'match' }>;

type Props = {
  exercise: MatchExercise;
  onComplete: (complete: boolean) => void;
};

export function MatchStep({ exercise, onComplete }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);

  const shuffled = useMemo(
    () => exercise.pairs.map((pair, index) => ({ text: pair[1], index })).reverse(),
    [exercise.pairs],
  );

  function selectAnswer(index: number) {
    if (selected === null || matched.includes(index)) return;

    if (selected === index) {
      const next = [...matched, index];
      setMatched(next);
      setSelected(null);
      setWrong(null);

      if (next.length === exercise.pairs.length) {
        onComplete(true);
      }
    } else {
      setWrong(index);
    }
  }

  return (
    <div className="mt-5 space-y-5">
      <p className="text-sm text-ink-2">Эхлээд англи үг, дараа нь тохирох монгол утгыг сонгоорой.</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-3">
          {exercise.pairs.map(([english], index) => {
            const done = matched.includes(index);

            return (
              <button
                key={english}
                type="button"
                disabled={done}
                onClick={() => {
                  setSelected(index);
                  setWrong(null);
                }}
                className={`min-h-16 w-full rounded-2xl border-2 p-3 text-sm font-bold transition-all ${
                  done
                    ? 'border-leaf bg-sage text-leaf-ink'
                    : selected === index
                      ? 'border-leaf bg-paper text-ink'
                      : 'border-line bg-paper text-ink hover:border-leaf'
                }`}
              >
                <Rich text={english} />
                {done && ' ✓'}
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          {shuffled.map(({ text, index }) => {
            const done = matched.includes(index);

            return (
              <button
                key={index}
                type="button"
                disabled={done}
                onClick={() => selectAnswer(index)}
                className={`min-h-16 w-full rounded-2xl border-2 p-3 text-sm font-bold transition-all ${
                  done
                    ? 'border-leaf bg-sage text-leaf-ink'
                    : wrong === index
                      ? 'border-rose bg-paper text-ink'
                      : 'border-line bg-paper text-ink hover:border-leaf'
                }`}
              >
                <Rich text={text} />
                {done && ' ✓'}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-center text-sm font-bold text-ink-2" aria-live="polite">
        {matched.length === exercise.pairs.length
          ? 'Бүх үгийг зөв таарууллаа! 🎉'
          : wrong !== null
            ? 'Дахин оролдоорой!'
            : `${matched.length}/${exercise.pairs.length} хос тааруулсан`}
      </p>
    </div>
  );
}
