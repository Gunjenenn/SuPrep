// Re-solves generated questions from their prompt text, independently of the template code.
// If a template ever computes a wrong answer, these tests catch it.
import { describe, expect, test } from 'bun:test';
import type { Question } from '../../../src/types';
import { finalAnswer, generate } from '../generate';

const qs = generate(11, 12);
const of = (key: string) => qs.filter((q) => q.id.startsWith(`g-${key}-s`));
const nums = (s: string) => (s.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
const ans = (q: Question) => Number(finalAnswer(q));
/** Parse "\frac{a}{b}" / "-\frac{a}{b}" / "3" into a number. */
function texNum(t: string): number {
  const m = t.match(/^(-)?\\frac\{(\d+)\}\{(\d+)\}$/);
  if (m) return (m[1] ? -1 : 1) * (Number(m[2]) / Number(m[3]));
  return Number(t);
}

describe('re-solve: algebra', () => {
  test('both sides', () => {
    for (const q of of('lin-both-sides')) {
      // "If $ax ± b = cx ± d$" — evaluate both sides at the answer
      const eq = q.prompt.match(/If \$([^$=]+) = ([^$]+)\$/)?.slice(1) ?? [];
      const at = (e: string, x: number) =>
        Function('x', `return ${e.replace(/(\d)x/g, '$1*x')}`)(x) as number;
      expect(at(eq[0] as string, ans(q))).toBe(at(eq[1] as string, ans(q)));
    }
  });
  test('consecutive', () => {
    for (const q of of('consecutive')) {
      const [sum] = nums(q.prompt.split('is ')[1] as string);
      const step = q.prompt.includes('even') ? 2 : 1;
      expect(3 * ans(q) + 3 * step).toBe(sum as number);
    }
  });
  test('budget: affordable, and one more is not', () => {
    for (const q of of('budget')) {
      const [budget, fee, rate] = nums(q.prompt);
      const n = ans(q);
      expect((fee as number) + (rate as number) * n).toBeLessThanOrEqual(budget as number);
      expect((fee as number) + (rate as number) * (n + 1)).toBeGreaterThan(budget as number);
    }
  });
  test('absolute value', () => {
    for (const q of of('abs-value')) {
      const m = q.prompt.match(/\|x ([+-]) (\d+)\| = (\d+)/);
      const a = (m?.[1] === '-' ? 1 : -1) * Number(m?.[2]);
      const b = Number(m?.[3]);
      const sols = [a + b, a - b];
      expect(ans(q)).toBe(q.prompt.includes('sum') ? sols[0]! + sols[1]! : Math.max(...sols));
    }
  });
  test('perpendicular slopes multiply to -1, parallel are equal', () => {
    for (const q of of('parallel-perp')) {
      const m = q.prompt.includes('\\frac{1}{2}x') ? 0.5 : Number(q.prompt.match(/y = (-?\d*)x/)?.[1] || 1);
      const k = texNum(finalAnswer(q));
      if (q.prompt.includes('perpendicular')) expect(m * k).toBeCloseTo(-1);
      else expect(k).toBe(m);
    }
  });
});

describe('re-solve: advanced', () => {
  test('discriminant count', () => {
    for (const q of of('discriminant')) {
      const m = q.prompt.match(/\$x\^2 ?([+-] \d*x)? ?([+-] \d+)? = 0\$/);
      const b = m?.[1]
        ? Number(
            m[1]
              .replace(' ', '')
              .replace(/x$/, '')
              .replace(/^([+-])$/, '$11'),
          )
        : 0;
      const c = m?.[2] ? Number(m[2].replace(' ', '')) : 0;
      const D = b * b - 4 * c;
      expect(ans(q)).toBe(D > 0 ? 2 : D === 0 ? 1 : 0);
    }
  });
  test('half-life', () => {
    for (const q of of('half-life')) {
      const [every, start, after] = nums(q.prompt);
      expect(ans(q)).toBe((start as number) / 2 ** ((after as number) / (every as number)));
    }
  });
  test('rational exponents', () => {
    for (const q of of('rational-exp')) {
      const [base, p, d] = nums(q.prompt);
      expect(ans(q)).toBeCloseTo((base as number) ** ((p as number) / (d as number)));
    }
  });
});

describe('re-solve: data', () => {
  test('weighted mean', () => {
    for (const q of of('weighted-mean')) {
      const [n1, m1, n2, m2] = nums(q.prompt);
      expect(ans(q)).toBe(
        ((n1 as number) * (m1 as number) + (n2 as number) * (m2 as number)) /
          ((n1 as number) + (n2 as number)),
      );
    }
  });
  test('sale price', () => {
    for (const q of of('sale-price')) {
      const [price, pct] = nums(q.prompt);
      expect(ans(q)).toBeCloseTo((price as number) * (1 - (pct as number) / 100));
    }
  });
  test('range', () => {
    for (const q of of('range')) {
      const xs = nums(q.prompt);
      expect(ans(q)).toBe(Math.max(...xs) - Math.min(...xs));
    }
  });
  test('table rate', () => {
    for (const q of of('table-rate')) {
      const xs = nums(q.prompt.split('$x$:')[1]?.split('.')[0] as string);
      const ys = nums(q.prompt.split('$y$:')[1]?.split('. What')[0] as string);
      const k = nums(q.prompt.split('when')[1] as string)[0] as number;
      const m = ((ys[1] as number) - (ys[0] as number)) / ((xs[1] as number) - (xs[0] as number));
      expect(ans(q)).toBe((ys[0] as number) + m * (k - (xs[0] as number)));
    }
  });
});

describe('re-solve: geometry', () => {
  test('arc length', () => {
    for (const q of of('arc-length')) {
      const [rad, angle] = nums(q.prompt);
      expect(ans(q)).toBeCloseTo((2 * (rad as number) * (angle as number)) / 360);
    }
  });
  test('distance', () => {
    for (const q of of('distance')) {
      const [x1, y1, x2, y2] = nums(q.prompt);
      expect(ans(q)).toBeCloseTo(
        Math.hypot((x2 as number) - (x1 as number), (y2 as number) - (y1 as number)),
      );
    }
  });
  test('midpoint', () => {
    for (const q of of('midpoint')) {
      const [x1, y1, x2, y2] = nums(q.prompt);
      expect(finalAnswer(q)).toBe(
        `(${((x1 as number) + (x2 as number)) / 2}, ${((y1 as number) + (y2 as number)) / 2})`,
      );
    }
  });
  test('angle pairs', () => {
    for (const q of of('angle-pairs')) {
      const [a] = nums(q.prompt.split('measure')[1] as string);
      expect(ans(q) + (a as number)).toBe(q.prompt.includes('complementary') ? 90 : 180);
    }
  });
});
