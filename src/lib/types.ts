export type Domain = "algebra" | "advanced_math" | "problem_solving" | "geometry_trig";
export type Difficulty = "easy" | "medium" | "hard";
export type QuestionType = "mcq" | "spr";

/** Хөтөч рүү илгээх асуулт — хариулт, тайлбаргүй. */
export type Question = {
  id: string;
  slug: string;
  domain: Domain;
  skill: string;
  difficulty: Difficulty;
  type: QuestionType;
  prompt: string;
  choices: string[] | null;
};

export const QUESTION_COLUMNS = "id, slug, domain, skill, difficulty, type, prompt, choices";

export type SubmitResult = {
  is_correct: boolean;
  correct_answer: string;
  explanation: string;
};

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type PlanTask = { skill: string; activity: string; questions: number; minutes: number };
export type PlanDay = { day: string; tasks: PlanTask[] };
export type PlanWeek = { week: number; focus: string; days: PlanDay[] };
export type StudyPlan = { summary: string; weeks: PlanWeek[]; tips: string[] };
