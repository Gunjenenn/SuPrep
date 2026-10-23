import { expect, test } from 'bun:test';
import mn from '@/features/tutor/messages/mn.json';
import { normalize, scriptedReply } from './scripted';

test('normalize ignores case, spaces, markdown and punctuation', () => {
  expect(normalize('**3x + 5 = 20?**')).toBe('3x+5=20');
});

test('every chat starter gets a hand-written answer', () => {
  for (const s of Object.values(mn.starters)) expect(scriptedReply(s)?.text.length).toBeGreaterThan(50);
});

test('pitch questions match even when typed differently', () => {
  expect(scriptedReply('If 3x + 5 = 20, what is the value of x?')?.lesson).toBe('intersection');
  expect(scriptedReply('3x+5=20 бол x хэд вэ')?.lesson).toBe('intersection');
  expect(scriptedReply('y = kx + 3 ба y = 2x − 1 шийдгүй байх k?')?.lesson).toBe('slider');
  expect(scriptedReply('(1, 2), (3, 8), (5, 14) цэгийг дайрах шулууны налалт')?.lesson).toBe('regression');
});

test('other questions are left to the model', () => {
  expect(scriptedReply('Пифагорын теорем гэж юу вэ?')).toBeNull();
});

test('math in answers is balanced so KaTeX can render it', () => {
  for (const s of [
    '3x+5=20',
    'kx+3',
    'регресс',
    'at least',
    'төлөвлөгөө',
    'ахиулах',
    'шугаман тэгшитгэл',
    'намайг шалгаач',
  ]) {
    const text = scriptedReply(s)?.text ?? '';
    expect(text.replace(/\\\$/g, '').split('$').length % 2).toBe(1);
  }
});
