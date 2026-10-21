import type { Difficulty, Domain } from "./types";

export const DOMAINS: { id: Domain; label: string; short: string; emoji: string }[] = [
  { id: "algebra", label: "Алгебр", short: "Алгебр", emoji: "𝑥" },
  { id: "advanced_math", label: "Ахисан түвшний математик", short: "Ахисан мат.", emoji: "ƒ" },
  { id: "problem_solving", label: "Бодлого бодолт ба өгөгдлийн шинжилгээ", short: "Өгөгдөл", emoji: "%" },
  { id: "geometry_trig", label: "Геометр ба тригонометр", short: "Геометр", emoji: "△" },
];

export const DOMAIN_LABEL: Record<Domain, string> = Object.fromEntries(
  DOMAINS.map((d) => [d.id, d.label]),
) as unknown as Record<Domain, string>;

export const DIFFICULTIES: { id: Difficulty; label: string }[] = [
  { id: "easy", label: "Хялбар" },
  { id: "medium", label: "Дунд" },
  { id: "hard", label: "Хүнд" },
];

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "Хялбар",
  medium: "Дунд",
  hard: "Хүнд",
};

const DOMAIN_ORDER: Record<Domain, number> = { algebra: 0, advanced_math: 1, problem_solving: 2, geometry_trig: 3 };
const DIFF_ORDER: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 };

export function sortQuestions<T extends { domain: Domain; difficulty: Difficulty; slug: string }>(qs: T[]): T[] {
  return [...qs].sort(
    (a, b) =>
      DOMAIN_ORDER[a.domain] - DOMAIN_ORDER[b.domain] ||
      DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty] ||
      a.slug.localeCompare(b.slug),
  );
}

export const LETTERS = ["A", "B", "C", "D"] as const;
