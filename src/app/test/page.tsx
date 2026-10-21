import { requireUser } from "@/lib/auth";
import { QUESTION_COLUMNS, type Question } from "@/lib/types";
import { TestRunner } from "./TestRunner";

export const dynamic = "force-dynamic";

const TEST_SIZE = 12;
const SECONDS_PER_QUESTION = 95; // Digital SAT: 22 асуулт / 35 мин ≈ 95 сек

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default async function TestPage() {
  const { supabase } = await requireUser();
  const { data } = await supabase.from("questions").select(QUESTION_COLUMNS);
  const all = (data ?? []) as unknown as Question[];

  // Хялбар → хүнд гэсэн дарааллаар, чиглэл бүрээс тэнцүүхэн сонгоно.
  const domains = ["algebra", "advanced_math", "problem_solving", "geometry_trig"] as const;
  const perDomain = Math.ceil(TEST_SIZE / domains.length);
  const picked = domains
    .flatMap((d) => shuffle(all.filter((q) => q.domain === d)).slice(0, perDomain))
    .slice(0, TEST_SIZE);
  const order = { easy: 0, medium: 1, hard: 2 } as const;
  picked.sort((a, b) => order[a.difficulty] - order[b.difficulty]);

  return <TestRunner questions={picked} durationSec={picked.length * SECONDS_PER_QUESTION} />;
}
