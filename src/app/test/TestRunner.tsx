"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { DesmosCalculator } from "@/components/DesmosCalculator";
import { MathMarkdown } from "@/components/MathMarkdown";
import { QuestionView } from "@/components/QuestionView";
import { DOMAIN_LABEL } from "@/lib/domains";
import { createClient } from "@/lib/supabase/client";
import type { Question, SubmitResult } from "@/lib/types";

type Phase = "intro" | "running" | "submitting" | "results";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function TestRunner({ questions, durationSec }: { questions: Question[]; durationSec: number }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [left, setLeft] = useState(durationSec);
  const [showCalc, setShowCalc] = useState(false);
  const [results, setResults] = useState<Record<string, SubmitResult>>({});
  const [error, setError] = useState<string | null>(null);
  const startedAt = useRef(0);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const finish = useCallback(async () => {
    setPhase("submitting");
    const supabase = createClient();
    const elapsed = Math.round((Date.now() - startedAt.current) / 1000);
    const perQ = Math.round(elapsed / Math.max(questions.length, 1));
    const out: Record<string, SubmitResult> = {};
    try {
      await Promise.all(
        questions.map(async (q) => {
          const { data, error: err } = await supabase.rpc("submit_answer", {
            p_question_id: q.id,
            p_selected: answersRef.current[q.id] ?? "",
            p_time_spent: perQ,
            p_source: "test",
          });
          if (err) throw err;
          out[q.id] = (Array.isArray(data) ? data[0] : data) as unknown as SubmitResult;
        }),
      );
      const correct = Object.values(out).filter((r) => r?.is_correct).length;
      await supabase.from("test_sessions").insert({ total: questions.length, correct, duration_sec: elapsed });
      setResults(out);
      setPhase("results");
    } catch {
      setError("Хариултыг илгээхэд алдаа гарлаа. Интернэтээ шалгаад дахин оролдоно уу.");
      setPhase("running");
    }
  }, [questions]);

  useEffect(() => {
    if (phase !== "running") return;
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "running" && left === 0) void finish();
  }, [left, phase, finish]);

  if (questions.length === 0) {
    return <div className="card p-10 text-center text-ink/60">Асуулт алга. supabase/seed.sql-ийг ажиллуулна уу.</div>;
  }

  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-xl card p-8 text-center">
        <div className="text-4xl">⏱️</div>
        <h1 className="mt-3 font-display text-3xl font-black">Хугацаатай тест</h1>
        <p className="mt-2 text-ink/65">
          {questions.length} асуулт · {Math.round(durationSec / 60)} минут. Жинхэнэ Digital SAT-ийн хурдаар (асуулт
          бүрт ~1.5 мин). AI багш тестийн үеэр ажиллахгүй, Desmos тооны машин ашиглаж болно.
        </p>
        <button
          onClick={() => {
            startedAt.current = Date.now();
            setPhase("running");
          }}
          className="btn-primary mt-6 !px-8 !py-3 text-base"
        >
          Эхлэх
        </button>
      </div>
    );
  }

  if (phase === "results") {
    const correct = questions.filter((q) => results[q.id]?.is_correct).length;
    const pct = Math.round((correct / questions.length) * 100);
    return (
      <div className="space-y-5">
        <div className="card flex flex-wrap items-center gap-6 p-6 md:p-8">
          <div className="grid h-28 w-28 place-items-center rounded-full bg-brand-600 text-white">
            <div className="text-center">
              <div className="font-display text-3xl font-black">
                {correct}/{questions.length}
              </div>
              <div className="text-xs opacity-80">{pct}%</div>
            </div>
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-black">Тест дууслаа!</h1>
            <p className="mt-1 text-ink/65">
              Хугацаа: {fmt(durationSec - left)}. Үр дүн таны шинжилгээнд нэмэгдлээ.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/analysis" className="btn-primary">
                AI шинжилгээ үзэх
              </Link>
              <a href="/test" className="btn-ghost">
                Шинэ тест
              </a>
            </div>
          </div>
        </div>

        {questions.map((q, i) => {
          const r = results[q.id];
          return (
            <details key={q.id} className="card p-5" open={!r?.is_correct}>
              <summary className="flex cursor-pointer items-center gap-3">
                <span
                  className={`grid h-8 w-8 place-items-center rounded-lg text-sm font-black ${
                    r?.is_correct ? "bg-brand-600 text-white" : "bg-red-100 text-red-600"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="text-sm font-bold">{q.skill}</span>
                <span className="text-xs text-ink/50">{DOMAIN_LABEL[q.domain]}</span>
                <span className="ml-auto text-xs text-ink/60">
                  Таны: <b>{answers[q.id] || "—"}</b> · Зөв: <b className="text-brand-700">{r?.correct_answer}</b>
                </span>
              </summary>
              <div className="mt-4 border-t border-brand-100 pt-4">
                <QuestionView
                  question={q}
                  value={answers[q.id] ?? ""}
                  onChange={() => {}}
                  disabled
                  correctAnswer={r?.correct_answer}
                />
                {r && (
                  <div className="mt-4 rounded-xl bg-brand-50 p-4 text-sm">
                    <MathMarkdown>{r.explanation}</MathMarkdown>
                  </div>
                )}
                <Link href={`/practice/${q.id}`} className="mt-3 inline-block text-sm font-semibold text-brand-700">
                  AI багштай ярилцах →
                </Link>
              </div>
            </details>
          );
        })}
      </div>
    );
  }

  const q = questions[idx];
  const answeredCount = questions.filter((x) => answers[x.id]).length;

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center gap-3 p-3">
        <div className="font-display text-sm font-black">
          Асуулт {idx + 1} / {questions.length}
        </div>
        <div
          className={`rounded-lg px-3 py-1 font-mono text-sm font-bold ${
            left < 120 ? "bg-red-100 text-red-700" : "bg-brand-50 text-brand-800"
          }`}
        >
          ⏱ {fmt(left)}
        </div>
        <button onClick={() => setShowCalc((v) => !v)} className="btn-ghost !py-1.5 text-xs">
          📈 {showCalc ? "Тооны машин хаах" : "Desmos"}
        </button>
        <button
          onClick={() => {
            if (confirmSubmit(answeredCount, questions.length)) void finish();
          }}
          disabled={phase === "submitting"}
          className="btn-dark ml-auto !py-1.5 text-xs"
        >
          {phase === "submitting" ? "Илгээж байна…" : "Дуусгах"}
        </button>
      </div>

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className={`grid gap-4 ${showCalc ? "lg:grid-cols-[1fr_420px]" : ""}`}>
        <div className="card p-6 md:p-8">
          <div className="mb-4 flex items-center justify-between">
            <span className="chip border-brand-200 bg-brand-50 text-brand-800">{DOMAIN_LABEL[q.domain]}</span>
            <button
              onClick={() =>
                setFlagged((f) => {
                  const n = new Set(f);
                  if (n.has(q.id)) n.delete(q.id);
                  else n.add(q.id);
                  return n;
                })
              }
              className={`chip ${flagged.has(q.id) ? "border-amber-400 bg-amber-50 text-amber-700" : "border-brand-200 text-ink/60"}`}
            >
              🚩 {flagged.has(q.id) ? "Тэмдэглэсэн" : "Дараа шалгах"}
            </button>
          </div>
          <QuestionView
            question={q}
            value={answers[q.id] ?? ""}
            onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
            disabled={phase === "submitting"}
          />
          <div className="mt-6 flex justify-between">
            <button onClick={() => setIdx((i) => i - 1)} disabled={idx === 0} className="btn-ghost">
              ← Өмнөх
            </button>
            {idx < questions.length - 1 ? (
              <button onClick={() => setIdx((i) => i + 1)} className="btn-primary">
                Дараах →
              </button>
            ) : (
              <button
                onClick={() => {
                  if (confirmSubmit(answeredCount, questions.length)) void finish();
                }}
                className="btn-dark"
              >
                Дуусгах
              </button>
            )}
          </div>
        </div>
        {showCalc && (
          <div className="card p-3">
            <DesmosCalculator height={520} />
          </div>
        )}
      </div>

      <div className="card flex flex-wrap gap-2 p-4">
        {questions.map((x, i) => (
          <button
            key={x.id}
            onClick={() => setIdx(i)}
            className={`relative h-9 w-9 rounded-lg text-sm font-bold ${
              i === idx
                ? "bg-ink text-white"
                : answers[x.id]
                  ? "bg-brand-600 text-white"
                  : "border border-brand-200 bg-white text-ink/60"
            }`}
          >
            {i + 1}
            {flagged.has(x.id) && <span className="absolute -right-1 -top-1 text-[10px]">🚩</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function confirmSubmit(answered: number, total: number) {
  if (answered >= total) return true;
  return window.confirm(`${total - answered} асуулт хариулаагүй байна. Тестийг дуусгах уу?`);
}
