"use client";

import { useState } from "react";
import { CatIcon } from "@/components/Logo";
import { MathMarkdown } from "@/components/MathMarkdown";

export function AiInsights() {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analysis", { method: "POST" });
      const j = (await res.json()) as unknown as { text?: string; error?: string };
      if (!res.ok || !j.text) throw new Error(j.error ?? "Алдаа гарлаа.");
      setText(j.text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 bg-ink p-5 text-white">
        <CatIcon size={40} />
        <div className="flex-1">
          <div className="font-display text-lg font-black">Суугийн дүгнэлт</div>
          <div className="text-sm text-white/60">Давуу тал, сул тал, дараагийн 7 хоногийн алхам</div>
        </div>
        <button onClick={run} disabled={loading} className="btn-primary">
          {loading ? "Шинжилж байна…" : text ? "Дахин шинжлэх" : "AI шинжилгээ хийх"}
        </button>
      </div>
      {(text || error) && (
        <div className="p-6">
          {error ? (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>
          ) : (
            <MathMarkdown>{text ?? ""}</MathMarkdown>
          )}
        </div>
      )}
    </div>
  );
}
