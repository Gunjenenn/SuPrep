import { describe, expect, test } from 'bun:test';
import { format, getT, lookup, makeT } from './i18n';

describe('i18n', () => {
  const msgs = { a: { b: 'Сайн уу, {name}!' }, flat: 'x' };

  test('lookup walks nested keys', () => {
    expect(lookup(msgs, 'a.b')).toBe('Сайн уу, {name}!');
    expect(lookup(msgs, 'a')).toBeUndefined();
    expect(lookup(msgs, 'nope.deeper')).toBeUndefined();
  });

  test('format fills vars and leaves unknown ones', () => {
    expect(format('{n} XP · {m}', { n: 40 })).toBe('40 XP · {m}');
  });

  test('makeT falls back to the key', () => {
    const t = makeT(msgs, 'a');
    expect(t('b', { name: 'Demo' })).toBe('Сайн уу, Demo!');
    expect(t('missing')).toBe('a.missing');
  });

  test('real messages: common namespace exists in both locales', () => {
    expect(getT('common', 'mn')('placeholder.title')).toBe('Энэ хэсгийг бэлдэж байна');
    expect(getT('common', 'en')('placeholder.title')).toBe('This section is being built');
  });
});
