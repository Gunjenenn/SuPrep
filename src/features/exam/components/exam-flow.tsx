'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createInitialExamState,
  EXAM_CONFIG,
  type ExamEvent,
  type ExamState,
  getRemainingSeconds,
  recoverExam,
  transitionExam,
} from '../lib/exam-machine';
import { ExamTimer } from './exam-timer';

const STORAGE_KEY = 'suprep-demo-exam-d1';

function readSavedState(): ExamState {
  const initial = createInitialExamState();

  try {
    const saved = window.sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return initial;

    const parsed: unknown = JSON.parse(saved);

    if (!parsed || typeof parsed !== 'object') return initial;

    const state = parsed as Partial<ExamState>;

    const phases = ['intro', 'module1', 'break', 'module2', 'results'];

    if (!state.phase || !phases.includes(state.phase)) {
      return initial;
    }

    if (
      state.endsAt !== null &&
      (typeof state.endsAt !== 'string' || !Number.isFinite(Date.parse(state.endsAt)))
    ) {
      return initial;
    }

    return recoverExam({
      phase: state.phase,
      endsAt: state.endsAt ?? null,
    });
  } catch {
    return initial;
  }
}

export function ExamFlow() {
  const [state, setState] = useState<ExamState>(createInitialExamState);
  const [ready, setReady] = useState(false);
  const stateRef = useRef(state);

  const updateState = useCallback((next: ExamState) => {
    stateRef.current = next;
    setState(next);

    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage may be unavailable.
    }
  }, []);

  useEffect(() => {
    updateState(readSavedState());
    setReady(true);
  }, [updateState]);

  const dispatch = useCallback(
    (event: ExamEvent) => {
      const next = transitionExam(stateRef.current, event, Date.now());

      updateState(next);
    },
    [updateState],
  );

  useEffect(() => {
    if (!ready) return;

    if (state.endsAt && getRemainingSeconds(state.endsAt) === 0) {
      dispatch('TIME_UP');
    }
  }, [ready, state, dispatch]);

  const onTimeUp = useCallback(() => {
    dispatch('TIME_UP');
  }, [dispatch]);

  if (!ready) {
    return <p className="py-12 text-center">Шалгалтыг ачаалж байна...</p>;
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 py-8">
      <header className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Suprep · SAT Math</p>
        <h1 className="text-3xl font-semibold">Mock Exam</h1>
      </header>

      {state.phase === 'intro' && (
        <div className="space-y-5 rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Шалгалтад бэлэн үү?</h2>
          <p>
            SAT Math шалгалт хоёр модультай. Модуль бүр
            {` ${EXAM_CONFIG.questionsPerModule} `}
            асуулттай, {EXAM_CONFIG.moduleMinutes} минут үргэлжилнэ.
          </p>
          <p>
            Хоёр модулийн хооронд {EXAM_CONFIG.breakMinutes}
            минутын завсарлага байна.
          </p>
          <button
            type="button"
            onClick={() => dispatch('START')}
            className="rounded-xl bg-foreground px-6 py-3 font-medium text-background"
          >
            Шалгалт эхлүүлэх
          </button>
        </div>
      )}

      {(state.phase === 'module1' || state.phase === 'module2') && (
        <div className="space-y-6 rounded-2xl border p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">{state.phase === 'module1' ? 'Module 1' : 'Module 2'}</h2>
            <ExamTimer endsAt={state.endsAt} onTimeUp={onTimeUp} />
          </div>

          <p className="text-muted-foreground">
            {EXAM_CONFIG.questionsPerModule} асуулт ·{` ${EXAM_CONFIG.moduleMinutes} `}минут
          </p>

          <p className="rounded-xl bg-muted p-4 text-sm">
            Асуулт харуулах хэсгийг D2/D3-ийн компоненттой дараа нь холбоно.
          </p>

          <button
            type="button"
            onClick={() => dispatch('SUBMIT')}
            className="rounded-xl bg-foreground px-6 py-3 font-medium text-background"
          >
            Модуль дуусгах
          </button>
        </div>
      )}

      {state.phase === 'break' && (
        <div className="space-y-5 rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Завсарлага</h2>
          <p>Дараагийн модуль автоматаар эхэлнэ.</p>
          <ExamTimer endsAt={state.endsAt} onTimeUp={onTimeUp} />
        </div>
      )}

      {state.phase === 'results' && (
        <div className="space-y-5 rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Шалгалт дууслаа!</h2>
          <p>Оноо тооцоолох хэсгийг D4 дээр холбоно.</p>
          <button
            type="button"
            onClick={() => updateState(createInitialExamState())}
            className="rounded-xl border px-6 py-3 font-medium"
          >
            Шинэ demo эхлүүлэх
          </button>
        </div>
      )}
    </section>
  );
}
