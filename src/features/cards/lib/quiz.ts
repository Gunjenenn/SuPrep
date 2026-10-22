import type { Card } from '@/types';

export type QuizKind = 'choice' | 'type' | 'listen' | 'tex';

export type QuizQuestion = {
  id: string;
  kind: QuizKind;
  cardId: string;
  prompt: string;
  say?: string;
  options: string[];
  answer: string;
};

export const QUIZ_SIZE = 5;
const WORD_KINDS: QuizKind[] = ['choice', 'type', 'listen', 'choice', 'type'];

type Rand = () => number;

export function shuffle<T>(items: T[], rand: Rand = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function options(answer: string, values: string[], rand: Rand): string[] {
  const others = [...new Set(values.filter((v) => v && v !== answer))];
  return shuffle([answer, ...others.slice(0, 3)], rand);
}

function question(card: Card, kind: QuizKind, near: Card[], far: Card[], rand: Rand): QuizQuestion {
  const id = `${card.id}:${kind}`;
  const sameKind = (c: Card) => Boolean(c.tex) === Boolean(card.tex);
  const values = (pick: (c: Card) => string | undefined) => {
    const a = shuffle(near.filter(sameKind), rand).map(pick);
    const b = shuffle(far.filter(sameKind), rand).map(pick);
    return [...a, ...b].filter((v): v is string => Boolean(v));
  };
  if (kind === 'tex' && card.tex) {
    return {
      id,
      kind,
      cardId: card.id,
      prompt: card.front,
      options: options(
        card.tex,
        values((c) => c.tex),
        rand,
      ),
      answer: card.tex,
    };
  }
  if (kind === 'type') {
    return { id, kind, cardId: card.id, prompt: card.back, options: [], answer: card.front };
  }
  if (kind === 'listen') {
    return {
      id,
      kind,
      cardId: card.id,
      prompt: '',
      say: card.front,
      options: options(
        card.front,
        values((c) => c.front),
        rand,
      ),
      answer: card.front,
    };
  }
  return {
    id: `${card.id}:choice`,
    kind: 'choice',
    cardId: card.id,
    prompt: card.front,
    options: options(
      card.back,
      values((c) => c.back),
      rand,
    ),
    answer: card.back,
  };
}

export function buildQuiz(cards: Card[], pool: Card[] = [], rand: Rand = Math.random): QuizQuestion[] {
  const picked = shuffle(cards, rand).slice(0, QUIZ_SIZE);
  const far = pool.filter((p) => !cards.some((c) => c.id === p.id));
  return picked.map((card, i) =>
    question(card, card.tex ? 'tex' : WORD_KINDS[i % WORD_KINDS.length], cards, far, rand),
  );
}

export function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function isCorrect(q: QuizQuestion, input: string): boolean {
  return q.kind === 'type' ? normalize(input) === normalize(q.answer) : input === q.answer;
}

export function sessionXp(knew: number, quizCorrect: number): number {
  return knew * 2 + quizCorrect * 4;
}
