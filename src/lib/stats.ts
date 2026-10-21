import type { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;
import { DOMAINS } from "./domains";
import type { Difficulty, Domain } from "./types";

type AttemptRow = {
  is_correct: boolean;
  time_spent_sec: number;
  created_at: string;
  source: "practice" | "test";
  question: { domain: Domain; skill: string; difficulty: Difficulty } | null;
};

export type SkillStat = {
  skill: string;
  domain: Domain;
  total: number;
  correct: number;
  accuracy: number;
  avgTime: number;
};

export type DomainStat = { domain: Domain; label: string; total: number; correct: number; accuracy: number };

export type Stats = {
  total: number;
  correct: number;
  accuracy: number;
  avgTime: number;
  last7Days: number;
  activeDays: number;
  streak: number;
  byDomain: DomainStat[];
  bySkill: SkillStat[];
  byDifficulty: { difficulty: Difficulty; total: number; correct: number; accuracy: number }[];
  estimatedScore: number | null;
};

const WEIGHT: Record<Difficulty, number> = { easy: 1, medium: 1.5, hard: 2 };

/** Улаанбаатарын цагаар YYYY-MM-DD. */
export const ubDate = (d: Date | string | number) =>
  new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Ulaanbaatar" });

const pct = (c: number, t: number) => (t === 0 ? 0 : Math.round((c / t) * 100));

/** Бүх тоог энд (код дээр) тооцно — AI-д зөвхөн бэлэн тоог өгнө. */
export async function getUserStats(supabase: SupabaseClient): Promise<Stats> {
  const { data } = await supabase
    .from("attempts")
    .select("is_correct, time_spent_sec, created_at, source, question:questions(domain, skill, difficulty)")
    .order("created_at", { ascending: false })
    .limit(3000);

  const rows = ((data ?? []) as unknown as AttemptRow[]).filter((r) => r.question);

  const total = rows.length;
  const correct = rows.filter((r) => r.is_correct).length;
  const avgTime = total ? Math.round(rows.reduce((s, r) => s + (r.time_spent_sec || 0), 0) / total) : 0;
  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const last7Days = rows.filter((r) => new Date(r.created_at).getTime() >= weekAgo).length;
  const days = new Set(rows.map((r) => ubDate(r.created_at)));
  const activeDays = days.size;
  let streak = 0;
  const cursor = new Date();
  if (!days.has(ubDate(cursor))) cursor.setTime(cursor.getTime() - 86400000);
  while (days.has(ubDate(cursor))) {
    streak += 1;
    cursor.setTime(cursor.getTime() - 86400000);
  }

  const byDomain: DomainStat[] = DOMAINS.map((d) => {
    const rs = rows.filter((r) => r.question!.domain === d.id);
    const c = rs.filter((r) => r.is_correct).length;
    return { domain: d.id, label: d.label, total: rs.length, correct: c, accuracy: pct(c, rs.length) };
  });

  const skillMap = new Map<string, { domain: Domain; total: number; correct: number; time: number }>();
  for (const r of rows) {
    const key = r.question!.skill;
    const s = skillMap.get(key) ?? { domain: r.question!.domain, total: 0, correct: 0, time: 0 };
    s.total += 1;
    s.correct += r.is_correct ? 1 : 0;
    s.time += r.time_spent_sec || 0;
    skillMap.set(key, s);
  }
  const bySkill: SkillStat[] = [...skillMap.entries()]
    .map(([skill, s]) => ({
      skill,
      domain: s.domain,
      total: s.total,
      correct: s.correct,
      accuracy: pct(s.correct, s.total),
      avgTime: Math.round(s.time / s.total),
    }))
    .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total);

  const byDifficulty = (["easy", "medium", "hard"] as Difficulty[]).map((difficulty) => {
    const rs = rows.filter((r) => r.question!.difficulty === difficulty);
    const c = rs.filter((r) => r.is_correct).length;
    return { difficulty, total: rs.length, correct: c, accuracy: pct(c, rs.length) };
  });

  let estimatedScore: number | null = null;
  if (total >= 10) {
    const recent = rows.slice(0, 200);
    let w = 0;
    let wc = 0;
    for (const r of recent) {
      const k = WEIGHT[r.question!.difficulty];
      w += k;
      wc += r.is_correct ? k : 0;
    }
    estimatedScore = Math.round((200 + 600 * (wc / w)) / 10) * 10;
  }

  return {
    total,
    correct,
    accuracy: pct(correct, total),
    avgTime,
    last7Days,
    activeDays,
    streak,
    byDomain,
    bySkill,
    byDifficulty,
    estimatedScore,
  };
}

/** AI-д өгөх товч статистик. */
export function statsForAI(s: Stats) {
  return {
    нийт_бодсон: s.total,
    нийт_зөв_хувь: s.accuracy,
    дундаж_хугацаа_сек: s.avgTime,
    сүүлийн_7_хоногт_бодсон: s.last7Days,
    ойролцоо_SAT_мат_оноо: s.estimatedScore,
    чиглэлээр: s.byDomain.map((d) => ({ чиглэл: d.label, бодсон: d.total, зөв_хувь: d.accuracy })),
    ур_чадвараар: s.bySkill.map((k) => ({
      ур_чадвар: k.skill,
      бодсон: k.total,
      зөв_хувь: k.accuracy,
      дундаж_сек: k.avgTime,
    })),
    түвшнээр: s.byDifficulty.map((d) => ({ түвшин: d.difficulty, бодсон: d.total, зөв_хувь: d.accuracy })),
  };
}
