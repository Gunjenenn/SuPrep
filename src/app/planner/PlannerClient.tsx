"use client";

import { useState } from "react";
import { PlanView } from "@/components/PlanView";
import type { StudyPlan } from "@/lib/types";

export function PlannerClient({
  initialPlan,
  initialCreatedAt,
  defaults,
}: {
  initialPlan: StudyPlan | null;
  initialCreatedAt: string | null;
  defaults: { testDate: string; targetScore: number; hoursPerWeek: number };
}) {
  const [plan, setPlan] = useState(initialPlan);
  const [createdAt, setCreatedAt] = useState(initialCreatedAt);
  const [testDate, setTestDate] = useState(defaults.testDate);
  const [targetScore, setTargetScore] = useState(defaults.targetScore);
  const [hoursPerWeek, setHoursPerWeek] = useState(defaults.hoursPerWeek);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testDate, targetScore, hoursPerWeek, notes: notes || undefined }),
      });
      const j = (await res.json()) as unknown as { plan?: StudyPlan; error?: string };
      if (!res.ok || !j.plan) throw new Error(j.error ?? "Алдаа гарлаа.");
      setPlan(j.plan);
      setCreatedAt(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <form onSubmit={generate} className="card h-fit space-y-4 p-5">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink/70">SAT шалгалтын өдөр</span>
          <input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} className="input" required />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink/70">Зорилтот математикийн оноо: {targetScore}</span>
          <input
            type="range"
            min={400}
            max={800}
            step={10}
            value={targetScore}
            onChange={(e) => setTargetScore(Number(e.target.value))}
            className="w-full accent-brand-600"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink/70">Долоо хоногт хэдэн цаг: {hoursPerWeek}</span>
          <input
            type="range"
            min={1}
            max={20}
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(Number(e.target.value))}
            className="w-full accent-brand-600"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink/70">Нэмэлт (заавал биш)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input min-h-20"
            maxLength={500}
            placeholder="ж: Геометр дээр сул, ажлын өдөр орой л завтай"
          />
        </label>
        <button className="btn-primary w-full !py-3" disabled={loading || !testDate}>
          {loading ? "Суу төлөвлөж байна…" : plan ? "Төлөвлөгөө шинэчлэх" : "Төлөвлөгөө гаргах"}
        </button>
        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </form>

      <div>
        {plan ? (
          <>
            {createdAt && (
              <p className="mb-3 text-xs text-ink/50">
                Гаргасан: {new Date(createdAt).toLocaleDateString("mn-MN")}
              </p>
            )}
            <PlanView plan={plan} />
          </>
        ) : (
          <div className="card grid h-full min-h-64 place-items-center p-10 text-center text-ink/55">
            <div>
              <div className="text-4xl">🗓️</div>
              <p className="mt-2">Мэдээллээ оруулаад «Төлөвлөгөө гаргах» дээр дарна уу.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
