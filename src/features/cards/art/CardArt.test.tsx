import { describe, expect, test } from 'bun:test';
import katex from 'katex';
import { DECKS } from '@/mocks/decks';
import { render } from '@/test/render';
import { ART, CardArt } from './CardArt';
import { ART_KINDS } from './kinds';

const cards = DECKS.flatMap((d) => d.cards);

describe('CardArt', () => {
  test('there is a drawing for all 18 art types', () => {
    expect(ART_KINDS).toHaveLength(18);
    expect(Object.keys(ART).sort()).toEqual([...ART_KINDS].sort());
  });

  test('every card uses an art type CardArt knows', () => {
    for (const c of cards) expect(ART_KINDS).toContain(c.art);
  });

  test('every card art renders an svg with content', () => {
    for (const c of cards) {
      const { container, unmount } = render(<CardArt art={c.art} v={c.v} />);
      const svg = container.querySelector('svg');
      expect(svg?.getAttribute('data-art')).toBe(c.art);
      expect(svg?.childElementCount).toBeGreaterThan(0);
      unmount();
    }
  });
});

test('every formula renders with KaTeX without errors', () => {
  const tex = cards.filter((c) => c.tex).map((c) => c.tex as string);
  expect(tex.length).toBe(16);
  for (const t of tex) {
    expect(() => katex.renderToString(t, { throwOnError: true, strict: 'ignore' })).not.toThrow();
  }
});
