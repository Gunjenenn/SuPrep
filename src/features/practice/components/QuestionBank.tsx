'use client';

import { useMemo, useState } from 'react';
import { Rich } from '@/components/math';
import type { Domain, Question } from '@/types';
import { filterQuestions } from '../lib/filter-questions';

type Props = {
  questions: Question[];
  savedIds?: string[];
  hardOnly?: boolean;
};

const domains: { id: Domain | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'alg', label: 'Algebra' },
  { id: 'adv', label: 'Advanced Math' },
  { id: 'psda', label: 'PSDA' },
  { id: 'geo', label: 'Geometry' },
];

export function QuestionBank({ questions, savedIds = [], hardOnly = false }: Props) {
  const [domain, setDomain] = useState<Domain | 'all'>('all');
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 'all'>(hardOnly ? 3 : 'all');
  const [desmosOnly, setDesmosOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [search, setSearch] = useState('');

  const visibleQuestions = useMemo(
    () =>
      filterQuestions(questions, {
        domain: domain === 'all' ? undefined : domain,
        difficulty: hardOnly ? 3 : difficulty === 'all' ? undefined : difficulty,
        desmosOnly,
        savedOnly,
        savedIds,
        search,
      }),
    [questions, domain, difficulty, hardOnly, desmosOnly, savedOnly, savedIds, search],
  );

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 p-6">
      {!hardOnly && (
        <header className="space-y-2">
          <p className="text-sm font-medium text-blue-600">SAT MATH</p>
          <h1 className="text-3xl font-bold">Question Bank</h1>
          <p className="text-sm text-gray-500">Browse, search, and filter SAT Math questions.</p>
        </header>
      )}

      <nav className="flex flex-wrap gap-2" aria-label="Question domains">
        {domains.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setDomain(item.id)}
            aria-pressed={domain === item.id}
            className={`rounded-full border px-4 py-2 text-sm ${
              domain === item.id
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Search</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search questions or skills..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>

        {!hardOnly && (
          <label className="space-y-1 text-sm">
            <span className="font-medium">Difficulty</span>
            <select
              value={difficulty}
              onChange={(event) =>
                setDifficulty(
                  event.target.value === 'all' ? 'all' : (Number(event.target.value) as 1 | 2 | 3),
                )
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="all">All difficulties</option>
              <option value="1">1 — Easy</option>
              <option value="2">2 — Medium</option>
              <option value="3">3 — Hard</option>
            </select>
          </label>
        )}

        <div className="flex flex-col justify-end gap-3 pb-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={desmosOnly}
              onChange={(event) => setDesmosOnly(event.target.checked)}
            />
            Desmos-supported only
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={savedOnly}
              onChange={(event) => setSavedOnly(event.target.checked)}
            />
            Saved questions only
          </label>
        </div>
      </section>

      <p className="text-sm text-gray-500" aria-live="polite">
        {visibleQuestions.length} questions found
      </p>

      <section className="space-y-3">
        {visibleQuestions.map((question) => (
          <article key={question.id} className="space-y-3 rounded-xl border border-gray-200 p-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span>{question.skill}</span>
              <span>•</span>
              <span>Difficulty {question.difficulty}</span>

              {question.desmos && (
                <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">Desmos</span>
              )}
            </div>

            <div className="whitespace-pre-wrap font-medium">
              <Rich text={question.prompt} />
            </div>

            {question.choices && (
              <ol className="list-inside list-[upper-alpha] space-y-1 text-sm">
                {question.choices.map((choice, index) => (
                  <li key={`${question.id}-${index}`}>
                    <Rich text={choice} />
                  </li>
                ))}
              </ol>
            )}
          </article>
        ))}

        {visibleQuestions.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
            <p className="font-medium">No questions found</p>
            <p className="mt-1 text-sm text-gray-500">Try changing your filters or search terms.</p>
          </div>
        )}
      </section>
    </main>
  );
}
