import { getT } from "@/lib/i18n";
import { BADGES } from "@/lib/badge-rules";
import { getProgressData } from "@/features/progress/actions";

export default async function AchievementsPage() {
  const t = getT("progress");

  // TODO: Session/Auth-аас одоогийн хэрэглэгчийн ID-г авна
  const userId = "test-user-id";

  let userBadges: { id: string; unlocked: boolean }[] = [];

  try {
    const data = await getProgressData(userId);
    if (data && data.badges) {
      userBadges = data.badges;
    }
  } catch (error) {
    userBadges = BADGES.map((b) => ({ ...b, unlocked: false }));
  }

  const unlockedCount = userBadges.filter((b) => b.unlocked).length;

  return (
    <div className="min-h-screen bg-[#060b08] text-white p-8 font-sans space-y-8">
      {/* Header хэсэг */}
      <div className="flex items-end justify-between border-b border-[#142319] pb-8">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#4ade80] font-semibold">
            АМЖИЛТУУД
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight mt-1 text-white">
            Тэмдгийн цуглуулга
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            Тэмдэг бүр бодит суралцах үйлдэлээр олгогдоно. Цуглуулгаа гүйцээгээрэй.
          </p>
        </div>
        <div className="text-right">
          <span className="text-5xl font-black text-white">
            <span className="text-[#a3e635]">{unlockedCount}</span>/{BADGES.length}
          </span>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">цуглуулсан</p>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {BADGES.map((badge) => {
          const isUnlocked = userBadges.find((b) => b.id === badge.id)?.unlocked;

          return (
            <div
              key={badge.id}
              className={`flex flex-col items-center justify-between p-6 rounded-2xl border text-center transition-all ${
                isUnlocked
                  ? "bg-[#0d1611] border-[#1f3829] shadow-lg shadow-black/40"
                  : "bg-[#0a100c]/60 border-[#142319] opacity-50"
              }`}
            >
              {/* Icon Circle */}
              <div className="my-2 relative flex items-center justify-center w-20 h-20 rounded-full border-2 border-[#1e3a2b] bg-[#112218]">
                <span className="text-3xl">{badge.icon}</span>
              </div>

              {/* Title & Description */}
              <div className="mt-3 space-y-1">
                <h3 className="font-bold text-base text-white">{badge.name}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed px-1">
                  {badge.description}
                </p>
              </div>

              {/* Status Pill */}
              <div className="mt-6">
                {isUnlocked ? (
                  <span className="inline-block px-3 py-1 text-[11px] font-medium text-[#a3e635] bg-[#1a3320] rounded-full border border-[#2c5837]">
                    Нээгдсэн
                  </span>
                ) : (
                  <span className="inline-block px-3 py-1 text-[11px] font-medium text-zinc-500 bg-[#121d16] rounded-full border border-[#1b2f23]">
                    Түгжээтэй
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}