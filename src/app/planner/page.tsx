import { requireUser } from "@/lib/auth";
import type { StudyPlan } from "@/lib/types";
import { PlannerClient } from "./PlannerClient";

export default async function PlannerPage() {
  const { supabase, user } = await requireUser();
  const [{ data: profile }, { data: plans }] = await Promise.all([
    supabase.from("profiles").select("target_score, test_date, hours_per_week").eq("id", user.id).maybeSingle(),
    supabase.from("study_plans").select("plan, created_at").order("created_at", { ascending: false }).limit(1),
  ]);
  const latest = plans?.[0] as unknown as { plan: StudyPlan; created_at: string } | undefined;
  const p = profile as unknown as { target_score: number | null; test_date: string | null; hours_per_week: number | null } | null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black">AI сургалтын төлөвлөгөө</h1>
        <p className="mt-1 text-sm text-ink/60">
          Шалгалтын өдөр, зорилгоо оруул. Суу таны бодсон асуултын статистикт тулгуурлан 4 долоо хоногийн төлөвлөгөө
          гаргана. Долоо хоног бүр шинэчлэхийг зөвлөж байна.
        </p>
      </div>
      <PlannerClient
        initialPlan={latest?.plan ?? null}
        initialCreatedAt={latest?.created_at ?? null}
        defaults={{
          testDate: p?.test_date ?? "",
          targetScore: p?.target_score ?? 700,
          hoursPerWeek: p?.hours_per_week ?? 6,
        }}
      />
    </div>
  );
}
