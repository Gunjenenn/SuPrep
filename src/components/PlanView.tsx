import type { StudyPlan } from "@/lib/types";

export function PlanView({ plan }: { plan: StudyPlan }) {
  return (
    <div className="space-y-5">
      <div className="card p-5">
        <div className="text-xs font-bold uppercase tracking-wide text-brand-700">Товч</div>
        <p className="mt-1 leading-relaxed">{plan.summary}</p>
      </div>
      {plan.weeks.map((w) => {
        const minutes = w.days.reduce((s, d) => s + d.tasks.reduce((t, x) => t + (x.minutes || 0), 0), 0);
        return (
          <div key={w.week} className="card overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 bg-ink px-5 py-3 text-white">
              <span className="font-display text-lg font-black">{w.week}-р долоо хоног</span>
              <span className="text-sm text-white/70">{w.focus}</span>
              <span className="ml-auto text-xs text-brand-300">≈ {Math.round((minutes / 60) * 10) / 10} цаг</span>
            </div>
            <div className="grid gap-px bg-brand-100 sm:grid-cols-2 lg:grid-cols-4">
              {w.days.map((d) => (
                <div key={d.day} className="bg-white p-4">
                  <div className="text-sm font-extrabold">{d.day}</div>
                  {d.tasks.length === 0 ? (
                    <div className="mt-2 text-xs text-ink/45">Амралт 😺</div>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {d.tasks.map((t, i) => (
                        <li key={i} className="rounded-lg bg-brand-50 p-2.5 text-xs">
                          <div className="font-bold text-brand-800">{t.skill}</div>
                          <div className="mt-0.5 text-ink/70">{t.activity}</div>
                          <div className="mt-1 text-[11px] text-ink/45">
                            {t.questions > 0 && `${t.questions} асуулт · `}
                            {t.minutes} мин
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {plan.tips.length > 0 && (
        <div className="card p-5">
          <div className="text-xs font-bold uppercase tracking-wide text-brand-700">Зөвлөгөө</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {plan.tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
