export type StartPoint = 'english' | 'foundations' | 'desmos';

export type Profile = {
  id: string;
  name: string;
  onboarded: boolean;
  /** 1–5 self-rated confidence. */
  confidence?: number;
  satExp?: 'none' | 'some' | 'taken';
  desmos?: 'never' | 'little' | 'often';
  /** Target Math score 200–800. */
  target: number;
  /** YYYY-MM-DD */
  examDate: string;
  start?: StartPoint;
};

export type TutorMode = 'hint' | 'explain' | 'desmos' | 'similar' | 'translate';
export type TutorContextKind = 'lesson' | 'desmos' | 'question' | 'mistake' | 'general';
export type TutorContext = {
  kind: TutorContextKind;
  id?: string;
  title: string;
  problem?: string;
  chosen?: string;
};
export type ChatMessage = {
  role: 'user' | 'suu';
  text: string;
  graph?: string[];
  mode?: TutorMode;
  at: number;
  demo?: boolean;
};
