import type { Domain } from './question';

/** One step inside a journey lesson. Text uses $…$ for TeX and **bold**. */
export type Exercise =
  | { kind: 'concept'; title: string; body: string; example?: { en: string; mn: string; tex: string } }
  | { kind: 'match'; prompt: string; pairs: [string, string][]; concept: string }
  | {
      kind: 'choice';
      prompt: string;
      options: string[];
      answer: number;
      explain: string;
      concept: string;
      hint?: string;
    }
  | {
      kind: 'build';
      prompt: string;
      sentence: string;
      tokens: string[];
      answer: string[];
      explain: string;
      concept: string;
      hint?: string;
    }
  | {
      kind: 'input';
      prompt: string;
      answer: string[];
      explain: string;
      concept: string;
      placeholder?: string;
      hint?: string;
    };

export type NodeKind = 'lesson' | 'checkpoint' | 'desmos' | 'practice' | 'timed' | 'review' | 'mock';

export type Lesson = {
  id: string;
  title: string;
  en: string;
  kind: NodeKind;
  xp: number;
  minutes: number;
  exercises?: Exercise[];
  /** Checkpoint: equivalent variant sets, served alternately on retries. Pass = 4 of 5. */
  variants?: Exercise[][];
  desmosId?: string;
  domain?: Domain | 'mixed';
  words?: number;
};

export type StageTone = 'leaf' | 'moss' | 'teal' | 'rose' | 'ink';

export type Stage = {
  id: string;
  no: number;
  title: string;
  en: string;
  blurb: string;
  tone: StageTone;
  nodes: Lesson[];
  badge?: string;
  alwaysOpen?: boolean;
};

export type NodeStatus = 'done' | 'current' | 'open' | 'locked';

/* ——— Desmos Academy ——— */

export type PoiKind = 'root' | 'yint' | 'max' | 'min' | 'intersection' | 'point';
export type TableInit = { table: [number, number][]; regression?: boolean };

export type DesmosStep =
  | { type: 'read'; say: string; cta?: string }
  | { type: 'pan'; say: string; hint: string }
  | { type: 'zoom'; say: string; hint: string }
  | { type: 'enter'; say: string; target: string; hint: string; demo?: string }
  | { type: 'select'; say: string; kind: PoiKind; at?: [number, number]; hint: string; wrong?: string }
  | { type: 'slider'; say: string; name: string; value: number; tol?: number; hint: string }
  | { type: 'regression'; say: string; hint: string }
  | {
      type: 'answer';
      say: string;
      prompt: string;
      accept: string[];
      hint: string;
      placeholder?: string;
      explain: string;
    }
  | { type: 'choice'; say: string; prompt: string; options: string[]; answer: number; explain: string };

export type DesmosLesson = {
  id: string;
  no: number;
  title: string;
  en: string;
  skill: string;
  minutes: number;
  xp: number;
  badge?: string;
  question?: string;
  intro: string;
  initial: (string | TableInit)[];
  steps: DesmosStep[];
  outro: string;
  manual?: string;
  featured?: boolean;
};

export type DesmosHack = { title: string; when: string; steps: string[]; rows: string[] };
