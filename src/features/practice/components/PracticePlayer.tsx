'use client';

import { useState } from 'react';
import { Rich } from '@/components/math';
import { toast } from '@/components/ui/toast';
import type { Question } from '@/types';

type Props = {
  questions: Question[];
};

function isCorrect(question: Question, value: string): boolean {
  if (typeof question.answer === 'number') {
    return value === String(question.answer);
  }

  const normalized = value.trim().replaceAll(',', '');
  return question.answer.some(
    (answer) => answer.trim().replaceAll(',', '') === normalized,
  );
}

export function PracticePlayer({ questions }: Props) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [marked, setMarked] = useState<string[]>([]);
  const [showDesmos, setShowDesmos] = useState(false);

  const question = questions[index];

  if (!question) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold">Дасгал</h1>
        <p className="mt-3 text-gray-500">Одоогоор асуулт алга байна.</p>
      </main>
    );
  }

  const correct = submitted && isCorrect(question, answer);
  const last = index === questions.length - 1;

  function submitAnswer(value: string) {
    if (submitted) return;

    setAnswer(value);
    setSubmitted(true);

    if (isCorrect(question, value)) {
      toast('+5 XP', { tone: 'xp' });
    }
  }

  function goTo(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= questions.length) return;

    setIndex(nextIndex);
    setAnswer('');
    setSubmitted(false);
    setHintVisible(false);
    setShowDesmos(false);
  }

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <header className="space-y-3">
        <p className="text-sm font-semibold text-blue-600">SAT MATH · PRACTICE</p>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Дасгал</h1>
          <span className="text-sm text-gray-500">
            {index + 1} / {questions.length}
          </span>
        </div>

        <div className="flex flex-wrap gap-2" aria-label="Асуулт сонгох">
          {questions.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`${i + 1}-р асуулт`}
              aria-current={i === index ? 'step' : undefined}
              className={`h-10 min-w-10 rounded-lg border px-3 text-sm font-semibold ${
                i === index
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : marked.includes(item.id)
                    ? 'border-amber-500 bg-amber-50 text-amber-800'
                    : 'border-gray-300'
              }`}
            >
              {marked.includes(item.id) ? '⚑' : i + 1}
            </button>
          ))}
        </div>
      </header>

      <section className="space-y-4 rounded-2xl border border-gray-200 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
          <span>{question.skill}</span>
          <span>Difficulty {question.difficulty}</span>
        </div>

        <div className="text-lg font-medium leading-relaxed">
          <Rich text={question.prompt} />
        </div>

        <button
          type="button"
          onClick={() =>
            setMarked((previous) =>
              previous.includes(question.id)
                ? previous.filter((id) => id !== question.id)
                : [...previous, question.id],
            )
          }
          aria-pressed={marked.includes(question.id)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          {marked.includes(question.id) ? '⚑ Тэмдэглэгээг авах' : '⚑ Асуултыг тэмдэглэх'}
        </button>

        {question.choices ? (
          <div className="grid gap-2">
            {question.choices.map((choice, i) => {
              const isSelected = answer === String(i);
              const isRight = question.answer === i;

              return (
                <button
                  key={`${question.id}-${i}`}
                  type="button"
                  disabled={submitted}
                  onClick={() => submitAnswer(String(i))}
                  className={`rounded-xl border-2 p-3 text-left ${
                    submitted && isRight
                      ? 'border-green-600 bg-green-50'
                      : submitted && isSelected
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-blue-500'
                  }`}
                >
                  <Rich text={choice} />
                </button>
              );
            })}
          </div>
        ) : (
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (answer.trim() && !submitted) submitAnswer(answer);
            }}
          >
            <input
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              disabled={submitted}
              aria-label="Хариулт"
              placeholder="Хариултаа бичнэ үү"
              className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3"
            />
            {!submitted && (
              <button
                type="submit"
                disabled={!answer.trim()}
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
              >
                Шалгах
              </button>
            )}
          </form>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setHintVisible((visible) => !visible)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {hintVisible ? 'Сэжүүр нуух' : 'Hint · Сэжүүр'}
          </button>

          {question.desmos && (
            <button
              type="button"
              onClick={() => setShowDesmos((visible) => !visible)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {showDesmos ? 'Desmos нуух' : 'Desmos арга → Тооцоолуурт харуулах'}
            </button>
          )}
        </div>

        {hintVisible && (
          <aside className="rounded-xl bg-amber-50 p-4 text-sm text-amber-950">
            <p className="mb-1 font-bold">Hint</p>
            <Rich text={question.hint} />
          </aside>
        )}

        {showDesmos && question.desmos && (
          <aside className="space-y-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-950">
            <p className="font-bold">Desmos арга</p>
            <p>{question.desmos.tip}</p>
            <ol className="list-inside list-decimal space-y-1">
              {question.desmos.rows.map((row, i) => (
                <li key={`${question.id}-row-${i}`} className="font-mono">
                  {row}
                </li>
              ))}
            </ol>
            <a
              href={`https://www.desmos.com/calculator?lang=mn`}
              target="_blank"
              rel="noreferrer"
              className="inline-block font-semibold underline"
            >
              Desmos тооцоолуур нээх
            </a>
          </aside>
        )}

        {submitted && (
          <section
            role="status"
            className={`space-y-2 rounded-xl p-4 ${
              correct
                ? 'bg-green-50 text-green-900'
                : 'bg-red-50 text-red-900'
            }`}
          >
            <h2 className="font-bold">
              {correct ? 'Зөв хариулт! +5 XP' : 'Буруу хариулт'}
            </h2>

            {!correct && (
              <div>
                <p className="font-bold">Яагаад?</p>
                <Rich
                  text={
                    question.choices && question.why?.[Number(answer)]
                      ? question.why[Number(answer)]
                      : question.explain
                  }
                />
              </div>
            )}

            {correct && (
              <div>
                <p className="font-bold">Тайлбар</p>
                <Rich text={question.explain} />
              </div>
            )}
          </section>
        )}

        <footer className="flex items-center justify-between gap-3 border-t border-gray-200 pt-4">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => goTo(index - 1)}
            className="rounded-xl border border-gray-300 px-4 py-2 disabled:opacity-40"
          >
            Өмнөх
          </button>
          <button
            type="button"
            disabled={last}
            onClick={() => goTo(index + 1)}
            className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-40"
          >
            Дараагийн асуулт
          </button>
        </footer>
      </section>
    </main>
  );
}