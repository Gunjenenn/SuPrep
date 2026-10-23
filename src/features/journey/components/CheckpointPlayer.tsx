'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CatHead } from '@/components/brand';
import { Rich } from '@/components/math/Rich';
import { Bar } from '@/components/ui/Bar';
import { Button } from '@/components/ui/Button';
import { routes } from '@/lib/routes';
import type { Exercise, Lesson } from '@/types';
import { saveJourneyProgress } from '../actions';
import { saveLocalProgress } from '../lib/local-progress';

type Props = {
  lesson: Lesson;
  demoMode: boolean;
};

type CheckpointExercise = Extract<Exercise, { kind: 'choice' | 'input' }>;

function normalize(value: string) {
  return value.trim().replace(/\s+/g, '').replace(/−/g, '-');
}

export function CheckpointPlayer({ lesson, demoMode }: Props) {
  const variants = (lesson.variants ?? []).filter((variant): variant is CheckpointExercise[] =>
    variant.every((exercise) => exercise.kind === 'choice' || exercise.kind === 'input'),
  );

  const [attempt, setAttempt] = useState(0);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [input, setInput] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const exercises = variants[attempt] ?? [];
  const current = exercises[step];

  const finished = step >= exercises.length && exercises.length > 0;

  const score = answers.filter(Boolean).length;

  const passed = exercises.length > 0 && score / exercises.length >= 0.8;

  const answered = answers.length > step;

  function submit(correct: boolean) {
    if (answered || saving) return;

    setAnswers((previous) => [...previous, correct]);
  }

  function submitInput() {
    if (!current || current.kind !== 'input' || !input.trim() || saving) {
      return;
    }

    const correct = current.answer.some((answer) => normalize(answer) === normalize(input));

    submit(correct);
  }

  async function next() {
    if (!answered || saving) return;

    if (step === exercises.length - 1) {
      const finalScore = answers.filter(Boolean).length;
      const isPassed = finalScore / exercises.length >= 0.8;

      setSaving(true);
      setSaveError(null);

      try {
        if (demoMode) {
          saveLocalProgress(lesson.id, isPassed, finalScore);
        } else {
          const result = await saveJourneyProgress({
            lessonId: lesson.id,
            done: isPassed,
            best: finalScore,
          });

          if (!result.ok) {
            setSaveError(
              result.reason === 'unauthorized'
                ? 'Үр дүнгээ хадгалахын тулд нэвтэрнэ үү.'
                : 'Үр дүнг хадгалж чадсангүй. Дахин оролдоно уу.',
            );
            return;
          }
        }
      } catch {
        setSaveError('Хадгалах үед алдаа гарлаа. Дахин оролдоно уу.');
        return;
      } finally {
        setSaving(false);
      }
    }

    setStep((previous) => previous + 1);
    setSelected(null);
    setInput('');
  }

  function retry() {
    if (attempt + 1 >= variants.length || saving) return;

    setAttempt((previous) => previous + 1);
    setStep(0);
    setAnswers([]);
    setSelected(null);
    setInput('');
    setSaveError(null);
  }

  if (exercises.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-ink-2">Checkpoint-ийн бодлогууд олдсонгүй.</p>

        <Link href={routes.journey}>← Journey руу буцах</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href={routes.journey} className="text-sm font-bold text-ink-2">
          ← Буцах
        </Link>

        <div className="flex-1">
          <Bar value={Math.min(step / exercises.length, 1)} tone="leaf" label="Checkpoint-ийн явц" />
        </div>

        <span className="text-sm font-bold text-ink-2">
          {Math.min(step + 1, exercises.length)}/{exercises.length}
        </span>
      </div>

      <div className="mb-8 rounded-3xl border border-line bg-paper p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-4">
          <CatHead size={76} mood={finished && passed ? 'happy' : 'think'} />

          <div>
            <p className="text-sm font-bold text-leaf">
              {finished ? 'Checkpoint-ийн үр дүн' : `Оролдлого ${attempt + 1}`}
            </p>

            <h1 className="mt-1 text-2xl font-extrabold text-ink">{lesson.title}</h1>

            <p className="text-sm text-ink-2">{lesson.en}</p>
          </div>
        </div>

        {finished ? (
          <div className="space-y-5 rounded-2xl bg-paper-2 p-6 text-center">
            <h2 className="text-2xl font-extrabold text-ink">
              {passed ? 'Checkpoint давлаа! 🎉' : 'Дахин давтаад оролдоорой'}
            </h2>

            <p className="text-lg font-bold text-ink">
              {score}/{exercises.length} зөв
            </p>

            <p className="text-sm text-ink-2">
              {passed
                ? 'Чи энэ шатны шалгалтад тэнцлээ.'
                : 'Тэнцэхийн тулд бодлогуудын 80%-д зөв хариулах шаардлагатай.'}
            </p>

            {!passed && attempt + 1 < variants.length && (
              <Button variant="primary" onClick={retry}>
                Өөр бодлогоор дахин оролдох →
              </Button>
            )}

            <Link href={routes.journey} className="block text-sm font-bold text-leaf">
              Journey руу буцах →
            </Link>
          </div>
        ) : current ? (
          <div className="rounded-2xl bg-paper-2 p-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-3">Бодлого {step + 1}</p>

            <h2 className="text-xl font-extrabold text-ink">
              <Rich text={current.prompt} />
            </h2>

            {current.kind === 'choice' ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {current.options.map((option, index) => (
                  <button
                    key={`${index}-${option}`}
                    type="button"
                    disabled={answered || saving}
                    onClick={() => {
                      setSelected(index);
                      submit(index === current.answer);
                    }}
                    className={`min-h-20 rounded-2xl border-2 p-4 text-left font-bold transition-colors ${
                      answered && index === current.answer
                        ? 'border-leaf bg-sage text-leaf-ink'
                        : answered && selected === index && !answers[step]
                          ? 'border-rose bg-paper text-ink'
                          : selected === index
                            ? 'border-leaf bg-sage text-leaf-ink'
                            : 'border-line bg-paper text-ink'
                    }`}
                  >
                    <span className="mr-2">{String.fromCharCode(65 + index)}.</span>

                    <Rich text={option} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={input}
                  disabled={answered || saving}
                  placeholder={current.placeholder ?? 'Хариултаа бичээрэй'}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !answered && !saving) {
                      submitInput();
                    }
                  }}
                  aria-label="Чиний хариулт"
                  className="w-full rounded-2xl border-2 border-line bg-paper px-5 py-4 text-xl font-bold text-ink outline-none focus:border-leaf"
                />

                <Button
                  variant="primary"
                  disabled={answered || saving || !input.trim()}
                  onClick={submitInput}
                >
                  Хариу илгээх
                </Button>
              </div>
            )}

            {answered && (
              <div className="mt-5 rounded-xl border border-line bg-paper p-4">
                <p className="font-bold text-ink">
                  {answers[step] ? 'Зөв хариуллаа! ✓' : 'Энэ удаа буруу хариуллаа.'}
                </p>

                <div className="mt-2 text-sm leading-7 text-ink-2">
                  <Rich text={current.explain} />
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {saveError && (
        <p role="alert" className="mb-4 text-sm font-semibold text-red-600">
          {saveError}
        </p>
      )}

      {!finished && (
        <div className="flex justify-end">
          <Button variant="primary" disabled={!answered || saving} onClick={next}>
            {saving
              ? 'Хадгалж байна...'
              : step === exercises.length - 1
                ? 'Үр дүн харах →'
                : 'Дараагийн бодлого →'}
          </Button>
        </div>
      )}
    </main>
  );
}
