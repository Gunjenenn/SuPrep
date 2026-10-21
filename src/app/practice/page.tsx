import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { DIFFICULTIES, DIFFICULTY_LABEL, DOMAINS, DOMAIN_LABEL, sortQuestions } from "@/lib/domains";
import type { Difficulty, Domain, Question } from "@/lib/types";

type Row = Pick<Question, "id" | "slug" | "domain" | "skill" | "difficulty" | "type">;

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string; difficulty?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const { supabase } = await requireUser();

  const [{ data: qData }, { data: aData }] = await Promise.all([
    supabase.from("questions").select("id, slug, domain, skill, difficulty, type"),
    supabase.from("attempts").select("question_id, is_correct, created_at").order("created_at", { ascending: true }),
  ]);

  const latest = new Map<string, boolean>();
  for (const a of (aData ?? []) as unknown as { question_id: string; is_correct: boolean }[]) latest.set(a.question_id, a.is_correct);

  let questions = sortQuestions((qData ?? []) as unknown as Row[]);
  const domain = DOMAINS.some((d) => d.id === sp.domain) ? (sp.domain as Domain) : undefined;
  const difficulty = DIFFICULTIES.some((d) => d.id === sp.difficulty) ? (sp.difficulty as Difficulty) : undefined;
  if (domain) questions = questions.filter((q) => q.domain === domain);
  if (difficulty) questions = questions.filter((q) => q.difficulty === difficulty);
  if (sp.status === "new") questions = questions.filter((q) => !latest.has(q.id));
  if (sp.status === "wrong") questions = questions.filter((q) => latest.get(q.id) === false);

  const href = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { domain, difficulty, status: sp.status, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/practice?${s}` : "/practice";
  };

  const filterQs = new URLSearchParams();
  if (domain) filterQs.set("domain", domain);
  if (difficulty) filterQs.set("difficulty", difficulty);
  const suffix = filterQs.toString() ? `?${filterQs}` : "";

  const pill = (active: boolean) =>
    `chip ${active ? "border-ink bg-ink text-white" : "border-brand-200 bg-white text-ink/70 hover:bg-brand-50"}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black">Асуултын сан</h1>
        <p className="mt-1 text-sm text-ink/60">Чиглэл, түвшнээр шүүж дасгал хий. Асуулт бүр дээр AI багш туслана.</p>
      </div>

      <div className="card space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          <Link href={href({ domain: undefined })} className={pill(!domain)}>
            Бүх чиглэл
          </Link>
          {DOMAINS.map((d) => (
            <Link key={d.id} href={href({ domain: d.id })} className={pill(domain === d.id)}>
              {d.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={href({ difficulty: undefined })} className={pill(!difficulty)}>
            Бүх түвшин
          </Link>
          {DIFFICULTIES.map((d) => (
            <Link key={d.id} href={href({ difficulty: d.id })} className={pill(difficulty === d.id)}>
              {d.label}
            </Link>
          ))}
          <span className="mx-1 w-px bg-brand-100" />
          <Link href={href({ status: undefined })} className={pill(!sp.status)}>
            Бүгд
          </Link>
          <Link href={href({ status: "new" })} className={pill(sp.status === "new")}>
            Бодоогүй
          </Link>
          <Link href={href({ status: "wrong" })} className={pill(sp.status === "wrong")}>
            Буруу бодсон
          </Link>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="card p-10 text-center text-ink/60">
          Энэ шүүлтүүрт асуулт алга. {(qData ?? []).length === 0 && "supabase/seed.sql-ийг ажиллуулсан эсэхээ шалгаарай."}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {questions.map((q, i) => {
            const st = latest.get(q.id);
            return (
              <Link
                key={q.id}
                href={`/practice/${q.id}${suffix}`}
                className="card flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:border-brand-300"
              >
                <div
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-black ${
                    st === true
                      ? "bg-brand-600 text-white"
                      : st === false
                        ? "bg-red-100 text-red-600"
                        : "bg-brand-50 text-ink/60"
                  }`}
                >
                  {st === true ? "✓" : st === false ? "✗" : i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{q.skill}</div>
                  <div className="mt-0.5 text-xs text-ink/50">
                    {DOMAIN_LABEL[q.domain]} · {DIFFICULTY_LABEL[q.difficulty]} ·{" "}
                    {q.type === "mcq" ? "Сонгох" : "Бичих"}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
