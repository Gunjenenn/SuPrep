import { describe, expect, test } from 'bun:test';
import { checkChoiceAnswer, checkGridInAnswer } from './check-answer';

describe('checkGridInAnswer', () => {
  test('accepts equivalent fractions and decimals', () => {
    expect(checkGridInAnswer('3/4', ['0.75'])).toBe(true);
    expect(checkGridInAnswer('37.5', ['75/2'])).toBe(true);
  });

  test('ignores thousands separators', () => {
    expect(checkGridInAnswer('60,000', ['60000'])).toBe(true);
  });

  test('normalizes whitespace and minus signs', () => {
    expect(checkGridInAnswer(' 42 ', ['42'])).toBe(true);
    expect(checkGridInAnswer('−5', ['-5'])).toBe(true);
  });

  test('rejects incorrect answers', () => {
    expect(checkGridInAnswer('0.5', ['2'])).toBe(false);
    expect(checkGridInAnswer('12', ['13'])).toBe(false);
  });

  test('rejects empty and invalid answers', () => {
    expect(checkGridInAnswer('', ['0'])).toBe(false);
    expect(checkGridInAnswer('abc', ['1'])).toBe(false);
    expect(checkGridInAnswer('1/0', ['1'])).toBe(false);
  });

  test('accepts any listed equivalent answer', () => {
    expect(checkGridInAnswer('0.5', ['1/3', '2/4'])).toBe(true);
  });

  test('handles negative fractions', () => {
    expect(checkGridInAnswer('-1/2', ['-0.5'])).toBe(true);
  });

  test('rejects malformed fractions', () => {
    expect(checkGridInAnswer('1/2/3', ['0.5'])).toBe(false);
  });
});

describe('checkChoiceAnswer', () => {
  test('accepts the correct index', () => {
    expect(checkChoiceAnswer(1, 1)).toBe(true);
  });

  test('rejects a wrong index', () => {
    expect(checkChoiceAnswer(0, 1)).toBe(false);
  });

  test('rejects invalid indices', () => {
    expect(checkChoiceAnswer(-1, 1)).toBe(false);
    expect(checkChoiceAnswer(1.5, 1)).toBe(false);
  });
});
