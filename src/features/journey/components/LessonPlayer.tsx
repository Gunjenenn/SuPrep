'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CatHead } from '@/components/brand';
import { Rich } from '@/components/math/Rich';
import { Bar } from '@/components/ui/Bar';
import { Button } from '@/components/ui/Button';
import { routes } from '@/lib/routes';
import type { Lesson } from '@/types';
import { saveLocalProgress } from '../lib/local-progress';
import { BuildStep } from './exercises/BuildStep';
import { ChoiceStep } from './exercises/ChoiceStep';
import { InputStep } from './exercises/InputStep';
import { MatchStep } from './exercises/MatchStep';

type Props = {
  lesson: Lesson;
};

export function LessonPlayer({ lesson }: Props) {
  const [step, setStep] = useState(0);
  const [completedMatches, setCompletedMatches] = useState<string[]>([]);
  const [completedChoices, setCompletedChoices] = useState<string[]>([]);
  const [completedBuilds, setCompletedBuilds] = useState<string[]>([]);
  const [completedInputs, setCompletedInputs] = useState<string[]>([]);
  const exercises = lesson.exercises ?? [];
  const total = exercises.length;
  const current = exercises[step];
  const matchKey = `${lesson.id}:${step}`;
  const choiceKey = `${lesson.id}:${step}`;
  const buildKey = `${lesson.id}:${step}`;
  const inputKey = `${lesson.id}:${step}`;
  const canContinue =
    current?.kind === 'match'
      ? completedMatches.includes(matchKey)
      : current?.kind === 'choice'
        ? completedChoices.includes(choiceKey)
        : current?.kind === 'build'
          ? completedBuilds.includes(buildKey)
          : current?.kind === 'input'
            ? completedInputs.includes(inputKey)
            : true;
  const finished = step >= total;

  const progress = total === 0 ? 0 : Math.min(step / total, 1);

  function handleContinue() {
    if (total === 0 || !canContinue || finished) return;

    if (step === total - 1) {
      saveLocalProgress(lesson.id, true, 0);
    }

    setStep((value) => Math.min(total, value + 1));
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href={routes.journey} className="text-sm font-bold text-ink-2 hover:text-ink">
          ← Буцах
        </Link>

        <div className="flex-1">
          <Bar value={progress} tone="leaf" label="Хичээлийн явц" />
        </div>

        <span className="text-sm font-bold text-ink-2">
          {Math.min(step + 1, total)}/{total}
        </span>
      </div>

      <div className="mb-8 rounded-3xl border border-line bg-paper p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-4">
          <CatHead size={76} mood={finished ? 'happy' : 'think'} />

          <div>
            <p className="text-sm font-bold text-leaf">{finished ? 'Хичээл дууслаа!' : 'Суу чамд тусална'}</p>
            <h1 className="mt-1 text-2xl font-extrabold text-ink">{lesson.title}</h1>
            <p className="text-sm text-ink-2">{lesson.en}</p>
          </div>
        </div>

        {finished ? (
          <div className="rounded-2xl bg-paper-2 p-6 text-center">
            <h2 className="text-xl font-extrabold text-ink">Сайн ажиллалаа! 🎉</h2>
            <p className="mt-2 text-sm text-ink-2">Чи энэ хичээлийн бүх алхмыг үзэж дууслаа.</p>
          </div>
        ) : current ? (
          <div className="min-h-48 rounded-2xl bg-paper-2 p-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-3">Алхам {step + 1}</p>

            <h2 className="text-xl font-extrabold text-ink">
              {current.kind === 'concept'
                ? current.title
                : current.kind === 'match'
                  ? current.prompt
                  : current.prompt}
            </h2>

            {current.kind === 'concept' ? (
              <div className="mt-4 text-base leading-8 text-ink-2">
                <Rich text={current.body} />
              </div>
            ) : current.kind === 'match' ? (
              <MatchStep
                key={matchKey}
                exercise={current}
                onComplete={(complete) => {
                  if (complete) {
                    setCompletedMatches((previous) =>
                      previous.includes(matchKey) ? previous : [...previous, matchKey],
                    );
                  }
                }}
              />
            ) : current.kind === 'choice' ? (
              <ChoiceStep
                key={choiceKey}
                exercise={current}
                onComplete={(complete) => {
                  if (complete) {
                    setCompletedChoices((previous) =>
                      previous.includes(choiceKey) ? previous : [...previous, choiceKey],
                    );
                  }
                }}
              />
            ) : current.kind === 'build' ? (
              <BuildStep
                key={buildKey}
                exercise={current}
                onComplete={(complete) => {
                  if (complete) {
                    setCompletedBuilds((previous) =>
                      previous.includes(buildKey) ? previous : [...previous, buildKey],
                    );
                  }
                }}
              />
            ) : current.kind === 'input' ? (
              <InputStep
                key={inputKey}
                exercise={current}
                onComplete={(complete) => {
                  if (complete) {
                    setCompletedInputs((previous) =>
                      previous.includes(inputKey) ? previous : [...previous, inputKey],
                    );
                  }
                }}
              />
            ) : (
              <p className="mt-4 text-sm text-ink-2">
                Энэ дасгалын интерактив хэсгийг дараагийн алхамд нэмнэ.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-ink-2">Энэ хичээлийн дасгалууд хараахан нэмэгдээгүй байна.</p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          disabled={step === 0}
          onClick={() => setStep((value) => Math.max(0, value - 1))}
        >
          ← Өмнөх
        </Button>

        {finished ? (
          <Link href={routes.journey}>
            <span className="inline-flex rounded-2xl bg-leaf px-6 py-3 font-bold text-white">
              Journey руу буцах →
            </span>
          </Link>
        ) : (
          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={total === 0 || !canContinue}
            className={!canContinue ? 'cursor-not-allowed opacity-40 grayscale' : 'cursor-pointer'}
          >
            Үргэлжлүүлэх →
          </Button>
        )}
      </div>
    </main>
  );
}
