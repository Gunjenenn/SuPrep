import type { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type AIFeature = "tutor" | "planner" | "analysis";

/** 24 цагт нэг хэрэглэгчийн хийж болох AI хүсэлтийн тоо (үнэгүй tier-ийг хамгаалах). */
export const DAILY_LIMITS: Record<AIFeature, number> = {
  tutor: 40,
  planner: 5,
  analysis: 10,
};

export async function consumeAIQuota(supabase: SupabaseClient, feature: AIFeature) {
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count, error } = await supabase
    .from("ai_usage")
    .select("id", { count: "exact", head: true })
    .eq("feature", feature)
    .gte("created_at", since);

  if (error) return { ok: false as const, remaining: 0 };
  const used = count ?? 0;
  const limit = DAILY_LIMITS[feature];
  if (used >= limit) return { ok: false as const, remaining: 0 };

  await supabase.from("ai_usage").insert({ feature });
  return { ok: true as const, remaining: limit - used - 1 };
}

export function quotaMessage(feature: AIFeature) {
  return `Өнөөдрийн AI хязгаар (${DAILY_LIMITS[feature]}) дууслаа. Маргааш дахин оролдоорой.`;
}
