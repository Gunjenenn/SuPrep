import Link from "next/link";
import { Bar, StatTile } from "@/components/StatBits";
import { requireUser } from "@/lib/auth";
import { DIFFICULTY_LABEL, DOMAIN_LABEL } from "@/lib/domains";
import { getUserStats } from "@/lib/stats";
import { AiInsights } from "./AiInsights";

export default async function AnalysisPage() {
  const { supabase } = await requireUser();
  const stats = await getUserStats(supabase);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black">AI шинжилгээ</h1>
        <p className="mt-1 text-sm text-ink/60">
          Тоонуудыг таны бодолтоос шууд тооцоолсон. AI зөвхөн тайлбар, зөвлөгөөг бичнэ.
        </p>
      </div>

      {stats.total === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-ink/60">Одоогоор бодсон асуулт алга.</p>
          <Link href="/practice" className="btn-primary mt-4">
            Дасгал эхлэх
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label="Ойролцоо SAT математик оноо"
              value={stats.estimatedScore ? String(stats.estimatedScore) : "—"}
              hint={stats.estimatedScore ? "Зөвхөн чиг хандлага, албан ёсны биш" : "10+ асуулт бодсны дараа"}
            />
            <StatTile label="Зөв хувь" value={`${stats.accuracy}%`} hint={`${stats.correct} / ${stats.total}`} />
            <StatTile label="Асуулт бүрт дундаж" value={`${stats.avgTime}с`} hint="SAT: ~95с" />
            <StatTile label="Сүүлийн 7 хоногт" value={String(stats.last7Days)} hint={`${stats.activeDays} идэвхтэй өдөр`} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="card space-y-4 p-5">
              <h2 className="font-display text-lg font-black">Чиглэлээр</h2>
              {stats.byDomain.map((d) => (
                <Bar key={d.domain} label={d.label} accuracy={d.accuracy} total={d.total} />
              ))}
              <h2 className="pt-2 font-display text-lg font-black">Түвшнээр</h2>
              {stats.byDifficulty.map((d) => (
                <Bar key={d.difficulty} label={DIFFICULTY_LABEL[d.difficulty]} accuracy={d.accuracy} total={d.total} />
              ))}
            </div>
            <div className="card p-5">
              <h2 className="font-display text-lg font-black">Ур чадвараар (сулаас нь)</h2>
              <div className="mt-3 divide-y divide-brand-50">
                {stats.bySkill.map((s) => (
                  <div key={s.skill} className="flex items-center gap-3 py-2.5 text-sm">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{s.skill}</div>
                      <div className="text-xs text-ink/45">{DOMAIN_LABEL[s.domain]}</div>
                    </div>
                    <div className="text-right tabular-nums">
                      <div className={`font-bold ${s.accuracy < 50 ? "text-amber-600" : "text-brand-700"}`}>
                        {s.accuracy}%
                      </div>
                      <div className="text-xs text-ink/45">
                        {s.correct}/{s.total} · {s.avgTime}с
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <AiInsights />
        </>
      )}
    </div>
  );
}
