import Link from "next/link";
import { CatIcon } from "@/components/Logo";
import { Countdown } from "@/components/Countdown";
import { HeroArt } from "@/components/HeroArt";
import { Icon } from "@/components/Icons";
import { Bar } from "@/components/StatBits";
import { requireUser } from "@/lib/auth";
import { getUserStats } from "@/lib/stats";
import type { StudyPlan } from "@/lib/types";

const WEEKDAY_MN: Record<string, string> = {
  Mon: "Даваа",
  Tue: "Мягмар",
  Wed: "Лхагва",
  Thu: "Пүрэв",
  Fri: "Баасан",
  Sat: "Бямба",
  Sun: "Ням",
};

function ubNow() {
  const d = new Date();
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Ulaanbaatar" }).format(d)) % 24;
  const wd = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "Asia/Ulaanbaatar" }).format(d);
  return { hour, day: WEEKDAY_MN[wd] ?? "" };
}

export default async function Dashboard() {
  const { supabase, user } = await requireUser();
  const [stats, { data: profile }, { data: plans }, { data: tests }] = await Promise.all([
    getUserStats(supabase),
    supabase.from("profiles").select("full_name, test_date, target_score").eq("id", user.id).maybeSingle(),
    supabase.from("study_plans").select("plan").order("created_at", { ascending: false }).limit(1),
    supabase.from("test_sessions").select("total, correct, created_at").order("created_at", { ascending: false }).limit(4),
  ]);

  const p = profile as unknown as { full_name: string | null; test_date: string | null; target_score: number | null } | null;
  const name = p?.full_name || user.email?.split("@")[0] || "";
  const plan = (plans?.[0] as unknown as { plan: StudyPlan } | undefined)?.plan;
  const testRows = (tests ?? []) as unknown as { total: number; correct: number; created_at: string }[];
  const { hour, day } = ubNow();
  const greeting = hour < 12 ? "Өглөөний мэнд" : hour < 18 ? "Өдрийн мэнд" : "Оройн мэнд";
  const todayTasks = plan?.weeks[0]?.days.find((d) => d.day === day)?.tasks ?? null;
  const testDateLabel = p?.test_date ? p.test_date.replaceAll("-", ".") : null;

  return (
    <>
      <HeroArt />
      <div className="relative space-y-8">
        {/* Top badges */}
        <div className="flex justify-end">
          <div className="flex items-center gap-1 rounded-2xl bg-white/90 p-1 shadow-sm ring-1 ring-brand-100">
            <div className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold" title="Дараалсан өдөр">
              <Icon name="flame" className="h-5 w-5 text-orange-500" />
              <span className="tabular-nums">{stats.streak}</span>
            </div>
            <div className="h-6 w-px bg-brand-100" />
            <div className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold text-brand-700" title="Зөв бодсон асуулт">
              <Icon name="check" className="h-5 w-5" />
              <span className="tabular-nums">{stats.correct}</span>
            </div>
          </div>
        </div>

        {/* Greeting + countdown */}
        <section className="flex flex-wrap items-end justify-between gap-6 pt-2 md:pt-6">
          <div>
            <h1 className="font-display text-3xl font-black tracking-tight md:text-4xl">
              {greeting}, <span className="text-ink/45">{name}</span>
            </h1>
            <p className="mt-3 text-lg text-ink/70">
              {plan ? "Өнөөдрийн даалгавраа хийцгээе 💪" : "Эхлээд сургалтын төлөвлөгөөгөө гаргая"}
            </p>
            <Link href={plan ? "/practice?status=new" : "/planner"} className="btn-primary mt-4 !px-5 !py-3 text-base">
              {plan ? "Дасгал эхлэх" : "Төлөвлөгөө гаргах"}
            </Link>
          </div>
          <div className="flex flex-col items-end gap-2">
            {p?.test_date ? (
              <>
                <Countdown date={p.test_date} />
                <Link href="/planner" className="flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink">
                  SAT хүртэл · <span className="font-semibold underline underline-offset-4">{testDateLabel}</span>
                  <Icon name="pencil" className="h-4 w-4" />
                </Link>
              </>
            ) : (
              <Link href="/planner" className="btn-ghost">
                <Icon name="calendar" className="h-4 w-4" /> Шалгалтын өдрөө тохируулах
              </Link>
            )}
          </div>
        </section>

        {/* Tutor banner */}
        <section className="relative overflow-hidden rounded-3xl bg-forest p-6 text-white md:p-8">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-500/30 blur-3xl" />
          <div className="relative flex flex-wrap items-center gap-6">
            <div className="flex-1">
              <h2 className="font-display text-2xl font-black md:text-3xl">AI багш Суу-тай хамт оноогоо өсгө</h2>
              <ul className="mt-4 space-y-2 text-white/85">
                {[
                  "Асуулт бүр дээр монголоор сэжүүр, тайлбар",
                  "Сул тал дээр чинь тулгуурласан өдөр тутмын төлөвлөгөө",
                  "Хугацаатай тест ба Desmos тооны машин",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2.5">
                    <Icon name="check" className="h-5 w-5 text-brand-400" />
                    {t}
                  </li>
                ))}
              </ul>
              <Link href="/tutor" className="btn mt-5 bg-brand-400 !px-5 text-ink hover:bg-brand-300">
                Суу-аас асуух →
              </Link>
            </div>
            <div className="hidden rotate-6 rounded-[2rem] bg-brand-600 p-2 shadow-2xl sm:block">
              <CatIcon size={150} />
            </div>
          </div>
        </section>

        {/* Study plan + scores */}
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-ink/60">
            <Icon name="list" className="h-5 w-5" /> Миний төлөвлөгөө
          </h2>
          <div className="mt-3 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="card p-6">
              {!plan ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <CatIcon size={88} />
                  <h3 className="mt-4 font-display text-xl font-black">Сургалтын төлөвлөгөө гаргах</h3>
                  <p className="mt-1 max-w-sm text-sm text-ink/60">
                    Шалгалтын өдөр, зорилтот оноо, сул талд чинь тулгуурлан Суу өдөр бүрийн даалгавар гаргана.
                  </p>
                  <Link href="/planner" className="btn-primary mt-5">
                    Эхлэх
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-black">Өнөөдөр · {day}</h3>
                    <Link href="/planner" className="text-sm font-semibold text-brand-700">
                      Бүтнээр →
                    </Link>
                  </div>
                  {todayTasks && todayTasks.length > 0 ? (
                    <ul className="mt-4 space-y-2.5">
                      {todayTasks.map((t, i) => (
                        <li key={i} className="flex items-center gap-3 rounded-xl bg-brand-50 p-3.5">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-sm font-black text-brand-700">
                            {i + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-bold">{t.skill}</div>
                            <div className="text-sm text-ink/60">{t.activity}</div>
                          </div>
                          <div className="shrink-0 text-xs font-semibold text-ink/45">{t.minutes} мин</div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 rounded-xl bg-brand-50 p-4 text-sm text-ink/65">
                      Өнөөдөр амралтын өдөр 😺 Хүсвэл алдаануудаа давтаарай.
                    </p>
                  )}
                  <p className="mt-4 text-xs text-ink/45">{plan.weeks[0]?.focus}</p>
                </>
              )}
            </div>

            <div className="space-y-4">
              <div className="card grid grid-cols-2 divide-x divide-brand-100">
                <div className="p-5">
                  <div className="font-display text-3xl font-black tabular-nums">{stats.estimatedScore ?? "—"}</div>
                  <div className="mt-1 text-sm text-ink/55">Одоогийн оноо</div>
                  {!stats.estimatedScore && <div className="text-[11px] text-ink/40">10+ асуулт бодоход</div>}
                </div>
                <Link href="/planner" className="group p-5">
                  <div className="font-display text-3xl font-black tabular-nums">{p?.target_score ?? "—"}</div>
                  <div className="mt-1 flex items-center gap-1 text-sm text-ink/55">
                    Зорилтот оноо <Icon name="pencil" className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
                  </div>
                </Link>
              </div>

              <div className="card p-5">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-semibold text-ink/70">
                    <Icon name="chart" className="h-5 w-5" /> Шинжилгээ
                  </h3>
                  <Link href="/analysis" className="btn-ghost !px-3 !py-1.5 text-xs">
                    Бүгдийг үзэх
                  </Link>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-xl bg-brand-50 p-3">
                    <div className="font-display text-xl font-black tabular-nums">{stats.total}</div>
                    <div className="text-xs text-ink/55">Бодсон</div>
                  </div>
                  <div className="rounded-xl bg-brand-50 p-3">
                    <div className="font-display text-xl font-black tabular-nums">
                      {stats.total ? `${stats.accuracy}%` : "—"}
                    </div>
                    <div className="text-xs text-ink/55">Зөв хувь</div>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {stats.byDomain.map((d) => (
                    <Bar key={d.domain} label={d.label} accuracy={d.accuracy} total={d.total} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tests */}
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-black">Сүүлийн тестүүд</h2>
            <Link href="/test" className="btn-dark !py-2 text-xs">
              Шинэ тест
            </Link>
          </div>
          {testRows.length === 0 ? (
            <p className="mt-3 text-sm text-ink/55">Тест өгөөгүй байна. 12 асуулттай хугацаатай тестээр эхэлж үзээрэй.</p>
          ) : (
            <ul className="mt-3 divide-y divide-brand-50">
              {testRows.map((t, i) => (
                <li key={i} className="flex justify-between py-2.5 text-sm">
                  <span className="text-ink/60">{new Date(t.created_at).toLocaleDateString("mn-MN")}</span>
                  <span className="font-bold tabular-nums">
                    {t.correct}/{t.total} ({Math.round((t.correct / t.total) * 100)}%)
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
