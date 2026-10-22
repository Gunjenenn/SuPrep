/** SAT Math content domains (share of the Math section). */
export type Domain = 'alg' | 'adv' | 'psda' | 'geo';

export type Question = {
  id: string;
  domain: Domain;
  skill: string;
  difficulty: 1 | 2 | 3;
  /** English, as on the SAT. Inline math in $…$. */
  prompt: string;
  /** Mongolian gloss for tricky vocabulary. */
  mn?: string;
  /** Present for multiple choice; absent for grid-in. */
  choices?: string[];
  /** Index into `choices` for MCQ, or accepted strings for grid-in. */
  answer: number | string[];
  explain: string;
  hint: string;
  /** Desmos rows that solve it. A row "TABLE:x,y;x,y" is a table, ";R" turns on regression. */
  desmos?: { rows: string[]; tip: string };
  /** Misconception shown for a wrong choice index. */
  why?: Record<number, string>;
  similar?: string;
  vocab?: string[];
};

export type QuestionFilter = {
  domain?: Domain;
  difficulty?: 1 | 2 | 3;
  desmosOnly?: boolean;
  search?: string;
};
