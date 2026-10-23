export async function getProgressData(userId: string) {
  "use server";

  const { getDb } = await import("@/lib/supabase/server");
  const { calculateLevel } = await import("@/lib/level");
  const { BADGES } = await import("@/lib/badge-rules");
  const { DAILY_QUESTS } = await import("./quests");
  const { getUlaanbaatarDate } = await import("@/lib/streak");

  const supabase = await getDb();
  

  if (!supabase) {
    const defaultLevel = calculateLevel(0);
    return {
      levelInfo: defaultLevel,
      streak: 0,
      quests: DAILY_QUESTS.map((q) => ({ ...q, current: 0, completed: false })),
      badges: BADGES.map((b) => ({ ...b, unlocked: false })),
    };
  }

  const today = getUlaanbaatarDate();


  const { data: profile } = await supabase
    .from("profiles")
    .select("xp, streak")
    .eq("id", userId)
    .single();

  const totalXp = profile?.xp || 0;
  const streak = profile?.streak || 0;
  const levelInfo = calculateLevel(totalXp);


  const { data: questProgressList } = await supabase
    .from("quest_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today);

  const quests = DAILY_QUESTS.map((q) => {
    const p = questProgressList?.find((item) => item.quest_id === q.id);
    return {
      ...q,
      current: p?.progress || 0,
      completed: p?.completed || false,
    };
  });


  const { data: userBadges } = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", userId);

  const unlockedBadgeIds = userBadges?.map((b) => b.badge_id) || [];
  const badges = BADGES.map((b) => ({
    ...b,
    unlocked: unlockedBadgeIds.includes(b.id),
  }));

  return {
    levelInfo,
    streak,
    quests,
    badges,
  };
}