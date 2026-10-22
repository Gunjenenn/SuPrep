import { describe, expect, test } from 'bun:test';
import { qs, routes } from './routes';

describe('routes', () => {
  test('static paths', () => {
    expect(routes.journey).toBe('/journey');
    expect(routes.desmosHome).toBe('/desmos');
  });

  test('ids are encoded', () => {
    expect(routes.lesson('s1-l3')).toBe('/lesson/s1-l3');
    expect(routes.deck('a b/c')).toBe('/cards/a%20b%2Fc');
    expect(routes.desmos('d3')).toBe('/desmos/d3');
  });

  test('query helpers skip empty values', () => {
    expect(qs({})).toBe('');
    expect(qs({ a: 1, b: undefined, c: '', d: false, e: true })).toBe('?a=1&e=1');
    expect(routes.bank()).toBe('/bank');
    expect(routes.bank({ domain: 'alg', difficulty: 3 })).toBe('/bank?domain=alg&level=3');
    expect(routes.practice({ ids: ['a1', 'a2'], timed: true })).toBe('/practice?ids=a1%2Ca2&timed=1');
    expect(routes.tutor({ kind: 'question', id: 'a2', chosen: '3' })).toBe(
      '/tutor?kind=question&id=a2&chosen=3',
    );
  });
});
