// Shared helpers for question templates: seeded random, TeX formatting, multiple-choice builder.
import type { Domain, Question } from '../../../src/types';

// ——— seeded random ———
export type Rng = () => number;
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const int = (r: Rng, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
export const pick = <T>(r: Rng, xs: readonly T[]): T => xs[Math.floor(r() * xs.length)] as T;
export const nonZero = (r: Rng, lo: number, hi: number) => {
  let v = 0;
  while (v === 0) v = int(r, lo, hi);
  return v;
};
export function shuffle<T>(r: Rng, xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j] as T, a[i] as T];
  }
  return a;
}

// ——— math formatting ———
export const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
/** Reduced fraction as TeX (no $), integers stay integers. */
export function frac(n: number, d: number): string {
  if (d < 0) return frac(-n, -d);
  const g = gcd(n, d) || 1;
  const [a, b] = [n / g, d / g];
  if (b === 1) return String(a);
  return a < 0 ? `-\\frac{${-a}}{${b}}` : `\\frac{${a}}{${b}}`;
}
/** "+ 5" / "- 5" for the term after the first one. */
export const term = (b: number) => (b < 0 ? `- ${-b}` : `+ ${b}`);
/** Coefficient in front of a variable: 1x → x, -1x → -x. */
export const coef = (a: number, v = 'x') => (a === 1 ? v : a === -1 ? `-${v}` : `${a}${v}`);
/** mx + b, dropping zero parts. */
export const lin = (m: number, b: number, v = 'x') => (b === 0 ? coef(m, v) : `${coef(m, v)} ${term(b)}`);
/** Wrap negatives in parentheses for substitution: (-3). */
export const par = (n: number) => (n < 0 ? `(${n})` : String(n));
export const num = (n: number) => (Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2))));

// ——— multiple choice builder ———
export type Option = { tex: string; why?: string };
/** Shuffles correct + distractors. Returns null if options collide (caller retries). */
export function mcq(r: Rng, correct: string, distractors: Option[]) {
  const seen = new Set([correct]);
  const ds = distractors.filter((d) => !seen.has(d.tex) && seen.add(d.tex));
  if (ds.length < 3) return null;
  const opts = shuffle(r, [{ tex: correct, why: undefined }, ...ds.slice(0, 3)]);
  const why: Record<number, string> = {};
  opts.forEach((o, i) => {
    if (o.why) why[i] = o.why;
  });
  return {
    choices: opts.map((o) => `$${o.tex}$`),
    answer: opts.findIndex((o) => o.tex === correct),
    why: Object.keys(why).length ? why : undefined,
  };
}

export type Draft = Omit<Question, 'id' | 'domain' | 'skill' | 'difficulty'> & { difficulty?: 1 | 2 | 3 };
export type Template = {
  key: string;
  domain: Domain;
  skill: string;
  difficulty: 1 | 2 | 3;
  make: (r: Rng) => Draft | null;
};

export const WRONG_SIGN = 'Тэмдэг алдсан байна — хасах/нэмэхээ дахин шалга.';

/** ax^2 + bx + c as TeX, dropping zero terms and 1-coefficients. */
export function quad(a: number, b: number, c: number, v = 'x'): string {
  const parts = [coef(a, `${v}^2`)];
  if (b !== 0) parts.push(b < 0 ? `- ${coef(-b, v)}` : `+ ${coef(b, v)}`);
  if (c !== 0) parts.push(term(c));
  return parts.join(' ');
}

/** a·x for TeX substitution steps: 1·x → x, -1·x → -x, otherwise a \\cdot (x). */
export const times = (a: number, x: number) =>
  a === 1 ? par(x) : a === -1 ? `-${par(x)}` : `${a} \\cdot ${par(x)}`;
