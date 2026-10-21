"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DesmosCalculator } from "@/components/DesmosCalculator";
import { MathMarkdown } from "@/components/MathMarkdown";
import { QuestionView } from "@/components/QuestionView";
import { TutorChat } from "@/components/TutorChat";
import { DIFFICULTY_LABEL, DOMAIN_LABEL } from "@/lib/domains";
import { createClient } from "@/lib/supabase/client";
import type { Question, SubmitResult } from "@/lib/types";

type Panel = "tutor" | "calc";

export function QuestionPlayer({
  question,
  position,
  total,
  prevHref,
  nextHref,
  backHref,
}: {
  question: Question;
  position: number | null;
  total: number;
  prevHref: string | null;
  nextHref: string | null;
  backHref: string;
}) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel>("tutor");
  const started = useRef(Date.now());

  useEffect(() => {
    setValue("");
    setResult(null);
    setError(null);
    started.current = Date.now();
  }, [question.id]);

  async function submit() {
    if (!value || submitting) return;
    setSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { data, error: err } = await supabase.rpc("submit_answer", {
      p_question_id: question.id,
      p_selected: value,
      p_time_spent: Math.round((Date.now() - started.current) / 1000),
      p_source: "practice",
    });
    setSubmitting(false);
    const row = (Array.isArray(data) ? data[0] : data) as unknown as SubmitResult | undefined;
    if (err || !row) {
      setError("Хариултыг шалгаж чадсангүй. Дахин оролдоно уу.");
      return;
    }
    setResult(row);
  }

  function retry() {
    setValue("");
    setResult(null);
    started.current = Date.now();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link href={backHref} className="font-semibold text-ink/60 hover:text-ink">
          ← Асуултын сан
        </Link>
        <span className="text-ink/30">/</span>
        <span className="chip border-brand-200 bg-brand-50 text-brand-800">{DOMAIN_LABEL[question.domain]}</span>
        <span className="chip border-brand-200 bg-white text-ink/70">{question.skill}</span>
        <span className="chip border-brand-200 bg-white text-ink/70">{DIFFICULTY_LABEL[question.difficulty]}</span>
        {position && (
          <span className="ml-auto text-xs font-semibold text-ink/50">
            {position} / {total}
          </span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
        <div className="card p-6 md:p-8">
          <QuestionView
            question={question}
            value={value}
            onChange={setValue}
            disabled={!!result}
            correctAnswer={result?.correct_answer}
          />

          {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          {result && (
            <div
              className={`mt-6 rounded-2xl border-2 p-5 ${
                result.is_correct ? "border-brand-300 bg-brand-50" : "border-red-200 bg-red-50/60"
              }`}
            >
              <div className="font-display text-lg font-black">
                {result.is_correct ? "Зөв! Сайн байна 🎉" : "Буруу байна — тайлбарыг үзээрэй"}
              </div>
              <div className="mt-3 text-sm">
                <div className="mb-1 text-xs font-bold uppercase tracking-wide text-ink/50">Тайлбар</div>
                <MathMarkdown>{result.explanation}</MathMarkdown>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {!result ? (
              <button onClick={submit} disabled={!value || submitting} className="btn-primary !px-6">
                {submitting ? "Шалгаж байна…" : "Шалгах"}
              </button>
            ) : (
              <button onClick={retry} className="btn-ghost">
                Дахин бодох
              </button>
            )}
            <div className="ml-auto flex gap-2">
              {prevHref && (
                <Link href={prevHref} className="btn-ghost">
                  ← Өмнөх
                </Link>
              )}
              {nextHref && (
                <Link href={nextHref} className={result ? "btn-dark" : "btn-ghost"}>
                  Дараах →
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="flex border-b border-brand-100 p-1.5">
            {(
              [
                ["tutor", "🐈‍⬛ AI багш"],
                ["calc", "📈 Desmos"],
              ] as [Panel, string][]
            ).map(([p, label]) => (
              <button
                key={p}
                onClick={() => setPanel(p)}
                className={`flex-1 rounded-lg py-2 text-sm font-bold ${
                  panel === p ? "bg-brand-600 text-white" : "text-ink/60 hover:bg-brand-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className={panel === "tutor" ? "" : "hidden"}>
            <TutorChat
              questionId={question.id}
              answered={!!result}
              selected={result ? value : undefined}
              wasCorrect={result?.is_correct}
            />
          </div>
          <div className={panel === "calc" ? "p-3" : "hidden"}>
            {panel === "calc" && <DesmosCalculator height={520} />}
          </div>
        </div>
      </div>
    </div>
  );
}
