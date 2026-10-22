import { expect, test } from 'bun:test';
import { diffKeys, keysOf } from './check-messages';

test('keysOf flattens nested keys', () => {
  expect(keysOf({ a: 'x', b: { c: 'y', d: { e: 'z' } } })).toEqual(['a', 'b.c', 'b.d.e']);
});

test('diffKeys reports keys missing on either side', () => {
  expect(diffKeys({ a: 'x', b: 'y' }, { a: 'x', c: 'z' })).toEqual({ onlyA: ['b'], onlyB: ['c'] });
});
