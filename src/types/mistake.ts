export type MistakeSource = 'practice' | 'exam' | 'lesson' | 'checkpoint' | 'hard';

export type Mistake = {
  id: string;
  /** Question id. */
  qid: string;
  /** What the student answered (choice index as string, or typed text). */
  chosen: string;
  /** Epoch ms when it was made. */
  at: number;
  resolved: boolean;
  source: MistakeSource;
  /** Spaced-review step 0–3 (3 = mastered). */
  box: number;
  /** Next review, epoch ms. */
  due: number;
};
