import { describe, expect, test } from 'bun:test';
import { finalAnswer, frac, generate, hintMentionsAnswer, TEMPLATES } from './generate';

const qs = generate(1, 12);

/** Re-solve a few template kinds independently from the prompt text. */
const nums = (s: string) => (s.match(/-?\d+/g) ?? []).map(Number);

describe('generated questions', () => {
  test('every template makes 12 unique questions', () => {
    expect(qs.length).toBe(TEMPLATES.length * 12);
    expect(new Set(qs.map((q) => q.prompt)).size).toBe(qs.length);
  });

  test('same seed → same questions (reproducible)', () => {
    expect(generate(1, 12).map((q) => q.prompt)).toEqual(qs.map((q) => q.prompt));
  });

  test('multiple choice: 4 unique choices, valid answer index', () => {
    for (const q of qs.filter((x) => x.choices)) {
      expect(q.choices).toHaveLength(4);
      expect(new Set(q.choices).size).toBe(4);
      expect(typeof q.answer).toBe('number');
      expect(q.choices?.[q.answer as number]).toBeDefined();
      for (const i of Object.keys(q.why ?? {})) expect(Number(i)).not.toBe(q.answer);
    }
  });

  test('explanation ends at the answer and hint never contains it', () => {
    for (const q of qs) {
      expect(q.explain).toContain(finalAnswer(q));
      expect(hintMentionsAnswer(q)).toBe(false);
    }
  });

  test('re-solved independently', () => {
    for (const q of qs) {
      const kind = q.id.split('-s')[0];
      const n = nums(q.prompt);
      const ans = Number(finalAnswer(q));
      if (kind === 'g-lin-eq') {
        const [a, b, c] = q.prompt.includes('- ')
          ? [n[0], -Math.abs(n[1] as number), n[2]]
          : [n[0], n[1], n[2]];
        expect((a as number) * ans + (b as number)).toBe(c as number);
      }
      if (kind === 'g-tri-angle') expect((n[0] as number) + (n[1] as number) + ans).toBe(180);
      if (kind === 'g-speed') expect(ans * (n[1] as number)).toBe(n[0] as number);
      if (kind === 'g-mean-missing') {
        const [mean, ...four] = n;
        expect(four.slice(0, 4).reduce((s, v) => s + v, 0) + ans).toBe(5 * (mean as number));
      }
      if (kind === 'g-median') {
        const xs = q.prompt.split('set ')[1]?.replace('?', '').split(', ').map(Number) ?? [];
        expect(xs.sort((a, b) => a - b)[(xs.length - 1) / 2]).toBe(ans);
      }
    }
  });

  test('frac reduces and keeps sign', () => {
    expect(frac(6, 8)).toBe('\\frac{3}{4}');
    expect(frac(4, 2)).toBe('2');
    expect(frac(3, -6)).toBe('-\\frac{1}{2}');
  });
});
