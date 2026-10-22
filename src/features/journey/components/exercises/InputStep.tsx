'use client';

import { useId, useState } from 'react';
import { Rich } from '@/components/math/Rich';
import type { Exercise } from '@/types';

type InputExercise = Extract<Exercise, { kind: 'input' }>;

type Props = {
  exercise: InputExercise;
  onComplete: (complete: boolean) => void;
};

export function InputStep({ exercise, onComplete }: Props) {
  const inputId = useId();
  const [value, setValue] = useState('');
  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);

  function checkAnswer() {
    const normalized = value.trim().replace(/\s+/g, '').replace('−', '-');

    const correct = exercise.answer.some(
      (answer) => answer.trim().replace(/\s+/g, '').replace('−', '-') === normalized,
    );

    setChecked(true);

    if (correct) {
      setSolved(true);
      onComplete(true);
    }
  }

  return (
    <div className="mt-5 space-y-5">
      <div>
        <label htmlFor={inputId} className="mb-3 block text-sm font-bold text-ink-2">
          Чиний хариулт
        </label>

        <input
          id={inputId}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          disabled={solved}
          placeholder={exercise.placeholder ?? 'Хариултаа бичээрэй'}
          onChange={(event) => {
            setValue(event.target.value);
            setChecked(false);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && value.trim() && !solved) {
              checkAnswer();
            }
          }}
          className="w-full rounded-2xl border-2 border-line bg-paper px-5 py-4 text-xl font-bold text-ink outline-none transition-colors focus:border-leaf disabled:opacity-60"
        />
      </div>

      <button
        type="button"
        disabled={!value.trim() || solved}
        onClick={checkAnswer}
        className="rounded-xl bg-leaf px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Хариу шалгах
      </button>

      {checked && (
        <div aria-live="polite" className="rounded-2xl border border-line bg-paper-2 p-4">
          <p className="font-extrabold text-ink">
            {solved ? 'Зөв хариуллаа! 🎉' : 'Хариултаа дахин шалгаарай.'}
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
            onClick={() => setShowHint((previous) => !previous)}
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
