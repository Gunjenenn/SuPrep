"use server";

import { getDb } from "@/lib/supabase/server";
import { getLevelByXp } from "@/lib/levels";
import { calculateNewStreak, getUlaanbaatarDate } from "@/lib/streak";

export async function awardXp(
  userId: string,
  amount: number,
  reason: string,
  idempotencyKey?: string
) {
  const supabase = await getDb();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const today = getUlaanbaatarDate();


  if (idempotencyKey) {
    const { data: existingEvent } = await supabase
      .from("xp_events")
      .select("id")
      .eq("user_id", userId)
      .eq("idempotency_key", idempotencyKey)
      .single();

    if (existingEvent) {
      return { success: true, duplicate: true };
    }
  }


  const { data: profile } = await supabase
    .from("profiles")
    .select("xp, streak, last_active_date")
    .eq("id", userId)
    .single();

  const currentXp = profile?.xp || 0;
  const currentStreak = profile?.streak || 0;
  const lastActive = profile?.last_active_date || null;

  const newXp = currentXp + amount;
  const oldLevel = getLevelByXp(currentXp).level;
  const newLevelInfo = getLevelByXp(newXp);
  const levelUp = newLevelInfo.level > oldLevel;


  const streakResult = calculateNewStreak(lastActive, currentStreak, today);


  await supabase.from("xp_events").insert({
    user_id: userId,
    amount,
    reason,
    idempotency_key: idempotencyKey || null,
    at: new Date().toISOString(),
  });


  await supabase
    .from("profiles")
    .update({
      xp: newXp,
      streak: streakResult.streak,
      last_active_date: today,
    })
    .eq("id", userId);

  return {
    success: true,
    xp: newXp,
    level: newLevelInfo,
    levelUp,
  };
}