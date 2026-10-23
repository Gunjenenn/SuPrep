import { describe, expect, test } from 'bun:test';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { TutorContext } from '@/types';
import { TutorChat } from './TutorChat';

type Reply = { status?: number; body?: unknown };

/** Fake /api/tutor that answers from a queue and records what was sent. */
function fakeApi(replies: Reply[]) {
  const sent: Record<string, unknown>[] = [];
  const fn = (async (_url: string, init: RequestInit) => {
    sent.push(JSON.parse(String(init.body)));
    const r = replies.shift() ?? { body: { text: 'ok' } };
    return r.status ? new Response('', { status: r.status }) : Response.json(r.body);
  }) as unknown as typeof fetch;
  return { fn, sent };
}

const general: TutorContext = { kind: 'general', title: 'SAT Math' };
const question: TutorContext = {
  kind: 'question',
  id: 'a1',
  title: 'Linear inequalities',
  problem: 'If $3x+5\\le 20$, greatest $x$?',
};

describe('TutorChat', () => {
  test('empty general chat shows starters; a starter is sent as free chat', async () => {
    const api = fakeApi([{ body: { text: 'Нийт 44 асуулт.', demo: false } }]);
    render(<TutorChat context={general} starters={['SAT Math хэдэн асуулттай вэ?']} fetchImpl={api.fn} />);
    fireEvent.click(screen.getByText('SAT Math хэдэн асуулттай вэ?'));
    await waitFor(() => expect(screen.getByText('Нийт 44 асуулт.')).toBeTruthy());
    expect(api.sent[0]).toMatchObject({ raw: true, message: 'SAT Math хэдэн асуулттай вэ?' });
    // a real (non-demo) reply can be rated
    expect(screen.getByLabelText('Тусалсан')).toBeTruthy();
  });

  test('quick action sends the problem in training format; demo replies are labelled and not rated', async () => {
    const api = fakeApi([{ body: { text: 'Эхлээд 5-ыг хас.', demo: true } }]);
    render(<TutorChat context={question} fetchImpl={api.fn} />);
    fireEvent.click(screen.getByText('Зөвлөгөө'));
    await waitFor(() => expect(screen.getByText('Эхлээд 5-ыг хас.')).toBeTruthy());
    expect(api.sent[0]).toMatchObject({ mode: 'hint', raw: false, context: { kind: 'question', id: 'a1' } });
    expect(screen.getByText(/Демо хариу/)).toBeTruthy();
    expect(screen.queryByLabelText('Тусалсан')).toBeNull();
  });

  test('typing + Enter sends; Shift+Enter does not', async () => {
    const api = fakeApi([{ body: { text: 'Сайн уу!' } }]);
    render(<TutorChat context={general} fetchImpl={api.fn} />);
    const box = screen.getByLabelText('Суу-д асуулт бичих');
    fireEvent.change(box, { target: { value: 'Сайн уу' } });
    fireEvent.keyDown(box, { key: 'Enter', shiftKey: true });
    expect(api.sent).toHaveLength(0);
    fireEvent.keyDown(box, { key: 'Enter' });
    await waitFor(() => expect(screen.getByText('Сайн уу!')).toBeTruthy());
    expect(api.sent).toHaveLength(1);
  });

  test('an error shows retry, and retry sends the same request again', async () => {
    const api = fakeApi([{ status: 500 }, { body: { text: 'Одоо болсон.' } }]);
    render(<TutorChat context={question} fetchImpl={api.fn} />);
    fireEvent.click(screen.getByText('Бүтэн тайлбар'));
    await waitFor(() => expect(screen.getByText('Дахин оролдох')).toBeTruthy());
    fireEvent.click(screen.getByText('Дахин оролдох'));
    await waitFor(() => expect(screen.getByText('Одоо болсон.')).toBeTruthy());
    expect(api.sent).toHaveLength(2);
    expect(api.sent[1]).toEqual(api.sent[0] as Record<string, unknown>);
  });

  test('send button is disabled for empty input', () => {
    render(<TutorChat context={general} fetchImpl={fakeApi([]).fn} />);
    expect((screen.getByText('Илгээх').closest('button') as HTMLButtonElement).disabled).toBe(true);
  });
});
