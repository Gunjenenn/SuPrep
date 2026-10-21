"use client";

import { LETTERS } from "@/lib/domains";
import type { Question } from "@/lib/types";
import { MathInline, MathMarkdown } from "./MathMarkdown";

/** Асуулт + сонголтууд. Practice ба Test хоёуланд ашиглана. */
export function QuestionView({
  question,
  value,
  onChange,
  disabled,
  correctAnswer,
}: {
  question: Question;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  correctAnswer?: string;
}) {
  return (
    <div>
      <MathMarkdown className="text-[17px]">{question.prompt}</MathMarkdown>

      {question.type === "mcq" && question.choices ? (
        <div className="mt-6 space-y-2.5">
          {question.choices.map((c, i) => {
            const letter = LETTERS[i];
            const picked = value === letter;
            const showResult = correctAnswer !== undefined;
            const isRight = showResult && letter === correctAnswer;
            const isWrongPick = showResult && picked && letter !== correctAnswer;
            return (
              <button
                key={letter}
                type="button"
                disabled={disabled}
                onClick={() => onChange(letter)}
                className={[
                  "flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition",
                  isRight
                    ? "border-brand-500 bg-brand-50"
                    : isWrongPick
                      ? "border-red-400 bg-red-50"
                      : picked
                        ? "border-ink bg-white"
                        : "border-brand-100 bg-white hover:border-brand-300",
                  disabled ? "cursor-default" : "",
                ].join(" ")}
              >
                <span
                  className={[
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-black",
                    isRight
                      ? "bg-brand-600 text-white"
                      : isWrongPick
                        ? "bg-red-500 text-white"
                        : picked
                          ? "bg-ink text-white"
                          : "bg-brand-50 text-ink/70",
                  ].join(" ")}
                >
                  {letter}
                </span>
                <MathInline>{c}</MathInline>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 max-w-xs">
          <label className="mb-1 block text-xs font-semibold text-ink/60">
            Хариултаа бичнэ үү (бүхэл тоо, бутархай 3/4, аравтын 0.75)
          </label>
          <input
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value.replace(/[^0-9./\-]/g, "").slice(0, 6))}
            className="input font-mono text-lg"
            inputMode="decimal"
            placeholder="ж: 12"
          />
          {correctAnswer !== undefined && (
            <p className="mt-2 text-sm">
              Зөв хариулт: <span className="font-bold text-brand-700">{correctAnswer}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
