import { describe, expect, test } from 'bun:test';
import type { TutorContext } from '@/types';
import { askSuu, newId, patch, requestFor, userBubbleText } from './chat';

const general: TutorContext = { kind: 'general', title: 'SAT Math' };
const question: TutorContext = {
  kind: 'question',
  id: 'a1',
  title: 'Linear inequalities',
  problem: 'If $3x+5\\le 20$ …',
};

describe('requestFor', () => {
  test('quick action sends the problem in training format', () => {
    expect(requestFor({ kind: 'quick', mode: 'hint' }, question)).toEqual({
      mode: 'hint',
      message: 'If $3x+5\\le 20$ …',
      raw: false,
      context: { kind: 'question', id: 'a1' },
    });
  });

  test('quick action without a problem sends nothing', () => {
    expect(requestFor({ kind: 'quick', mode: 'hint' }, general)).toBeNull();
  });

  test('free text is raw; in a question chat the problem goes first', () => {
    expect(requestFor({ kind: 'free', text: '  Сайн уу ' }, general)).toEqual({
      mode: 'explain',
      message: 'Сайн уу',
      raw: true,
      context: undefined,
    });
    expect(requestFor({ kind: 'free', text: 'яагаад?' }, question)?.message).toBe(
      'If $3x+5\\le 20$ …\n\nяагаад?',
    );
  });

  test('a chosen wrong answer is included (mistake review)', () => {
    const ctx: TutorContext = { ...question, kind: 'mistake', chosen: 'B) $6$' };
    expect(requestFor({ kind: 'quick', mode: 'explain' }, ctx)?.message).toContain('Миний хариу: B) $6$');
  });

  test('empty text sends nothing; long text is cut to the API limit', () => {
    expect(requestFor({ kind: 'free', text: '   ' }, general)).toBeNull();
    expect(requestFor({ kind: 'free', text: 'x'.repeat(5000) }, general)?.message.length).toBe(2000);
  });
});

describe('helpers', () => {
  test('user bubble shows the button label for quick actions', () => {
    expect(userBubbleText({ kind: 'quick', mode: 'hint' }, (m) => `[${m}]`)).toBe('[hint]');
    expect(userBubbleText({ kind: 'free', text: ' hi ' }, () => '')).toBe('hi');
  });

  test('ids are unique', () => {
    const ids = new Set(Array.from({ length: 100 }, () => newId('m')));
    expect(ids.size).toBe(100);
  });

  test('patch updates only the matching message', () => {
    const list = [
      { id: 'a', role: 'user' as const, text: '1' },
      { id: 'b', role: 'suu' as const, text: '', status: 'pending' as const },
    ];
    const next = patch(list, 'b', { text: 'ok', status: undefined });
    expect(next[1]).toMatchObject({ text: 'ok', status: undefined });
    expect(next[0]).toBe(list[0]);
  });
});

describe('askSuu', () => {
  test('returns text and demo flag', async () => {
    const f = (async () => Response.json({ text: 'Сайн уу!', demo: true })) as unknown as typeof fetch;
    expect(await askSuu({ mode: 'hint', message: 'x', raw: true }, f)).toEqual({
      text: 'Сайн уу!',
      demo: true,
    });
  });

  test('throws on server error or empty reply', async () => {
    const e500 = (async () => new Response('', { status: 500 })) as unknown as typeof fetch;
    const empty = (async () => Response.json({})) as unknown as typeof fetch;
    await expect(askSuu({ mode: 'hint', message: 'x', raw: true }, e500)).rejects.toThrow();
    await expect(askSuu({ mode: 'hint', message: 'x', raw: true }, empty)).rejects.toThrow();
  });
});
