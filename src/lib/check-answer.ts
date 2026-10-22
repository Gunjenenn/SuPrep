/**
 * Normalize a SAT grid-in answer before comparing it.
 * Does not use eval().
 */
function normalizeAnswer(value: string): string {
  return value.trim().replace(/\s+/g, '').replace(/−/g, '-').replace(/,/g, '');
}

function numericValue(value: string): number | null {
  const normalized = normalizeAnswer(value);

  if (!normalized) return null;

  // Decimal or integer
  if (/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(normalized)) {
    const number = Number(normalized);
    return Number.isFinite(number) ? number : null;
  }

  // Fraction: numerator/denominator
  const fraction = normalized.match(/^([+-]?(?:\d+\.?\d*|\.\d+))\/([+-]?(?:\d+\.?\d*|\.\d+))$/);

  if (!fraction) return null;

  const numerator = Number(fraction[1]);
  const denominator = Number(fraction[2]);

  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return null;
  }

  return numerator / denominator;
}

/**
 * Check a typed SAT grid-in answer against accepted answers.
 */
export function checkGridInAnswer(given: string, accepted: string[]): boolean {
  const actual = numericValue(given);

  if (actual === null) return false;

  return accepted.some((answer) => {
    const expected = numericValue(answer);

    if (expected === null) {
      return normalizeAnswer(given).toLowerCase() === normalizeAnswer(answer).toLowerCase();
    }

    return Math.abs(actual - expected) < 1e-10;
  });
}

/**
 * Check a multiple-choice answer by its zero-based index.
 */
export function checkChoiceAnswer(givenIndex: number, correctIndex: number): boolean {
  return (
    Number.isInteger(givenIndex) &&
    Number.isInteger(correctIndex) &&
    givenIndex >= 0 &&
    correctIndex >= 0 &&
    givenIndex === correctIndex
  );
}
