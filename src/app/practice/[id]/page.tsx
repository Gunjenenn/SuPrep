import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { DIFFICULTIES, DOMAINS, sortQuestions } from "@/lib/domains";
import { QUESTION_COLUMNS, type Question } from "@/lib/types";
import { QuestionPlayer } from "./QuestionPlayer";

export default async function QuestionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ domain?: string; difficulty?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase } = await requireUser();

  const { data } = await supabase.from("questions").select(QUESTION_COLUMNS);
  let all = sortQuestions((data ?? []) as unknown as Question[]);
  const question = all.find((q) => q.id === id);
  if (!question) notFound();

  if (DOMAINS.some((d) => d.id === sp.domain)) all = all.filter((q) => q.domain === sp.domain);
  if (DIFFICULTIES.some((d) => d.id === sp.difficulty)) all = all.filter((q) => q.difficulty === sp.difficulty);
  const idx = all.findIndex((q) => q.id === id);

  const qs = new URLSearchParams();
  if (sp.domain) qs.set("domain", sp.domain);
  if (sp.difficulty) qs.set("difficulty", sp.difficulty);
  const suffix = qs.toString() ? `?${qs}` : "";
  const link = (q?: Question) => (q ? `/practice/${q.id}${suffix}` : null);

  return (
    <QuestionPlayer
      question={question}
      position={idx >= 0 ? idx + 1 : null}
      total={all.length}
      prevHref={idx > 0 ? link(all[idx - 1]) : null}
      nextHref={idx >= 0 ? link(all[idx + 1]) : null}
      backHref={`/practice${suffix}`}
    />
  );
}
