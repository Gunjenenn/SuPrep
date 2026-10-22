import { describe, expect, test } from 'bun:test';
import formulas from '../../../../content/cards/formulas.json';
import words from '../../../../content/cards/words.json';
import { ContentSchema, MyCardInput, parseDecks } from './content';

const wordDecks = parseDecks(words);
const formulaDecks = parseDecks(formulas);
const wordCards = wordDecks.flatMap((d) => d.cards);
const formulaCards = formulaDecks.flatMap((d) => d.cards);

describe('content/cards schema', () => {
  test('both files match the schema', () => {
    expect(ContentSchema.safeParse(words).success).toBe(true);
    expect(ContentSchema.safeParse(formulas).success).toBe(true);
  });

  test('prototype content: 36 words and 16 formulas', () => {
    expect(wordCards).toHaveLength(36);
    expect(formulaCards).toHaveLength(16);
  });

  test('deck kinds match their file', () => {
    expect(wordDecks.every((d) => d.kind === 'word')).toBe(true);
    expect(formulaDecks.every((d) => d.kind === 'formula')).toBe(true);
  });

  test('card and deck ids are unique', () => {
    const ids = [...wordCards, ...formulaCards].map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    const deckIds = [...wordDecks, ...formulaDecks].map((d) => d.id);
    expect(new Set(deckIds).size).toBe(deckIds.length);
  });

  test('every word has IPA and a Mongolian pronunciation', () => {
    for (const c of wordCards) {
      expect(c.ipa?.trim()).toBeTruthy();
      expect(c.say?.trim()).toBeTruthy();
      expect(c.ipa).toMatch(/^\/.+\/$/);
    }
  });

  test('every formula has TeX and a «when» hint', () => {
    for (const c of formulaCards) {
      expect(c.tex?.trim()).toBeTruthy();
      expect(c.when?.trim()).toBeTruthy();
    }
  });

  test('an unknown art type is rejected', () => {
    const bad = { decks: [{ ...wordDecks[0], cards: [{ ...wordCards[0], art: 'rocket' }] }] };
    expect(ContentSchema.safeParse(bad).success).toBe(false);
  });
});

describe('MyCardInput', () => {
  test('trims and accepts a valid card', () => {
    expect(MyCardInput.parse({ front: '  ratio ', back: 'харьцаа' })).toEqual({
      front: 'ratio',
      back: 'харьцаа',
      hook: '',
      ex: '',
    });
  });

  test('rejects empty and too long fields', () => {
    const r = MyCardInput.safeParse({ front: '   ', back: 'x'.repeat(81) });
    expect(r.success).toBe(false);
    const paths = r.success ? [] : r.error.issues.map((i) => i.path[0]);
    expect(paths).toEqual(['front', 'back']);
  });
});
