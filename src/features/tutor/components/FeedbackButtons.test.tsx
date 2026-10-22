import { expect, test } from 'bun:test';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FeedbackButtons } from './FeedbackButtons';

function fakeFetch() {
  const calls: { url: string; body: Record<string, unknown> }[] = [];
  const fn = (async (url: string, init: RequestInit) => {
    calls.push({ url, body: JSON.parse(String(init.body)) });
    return new Response('{}', { status: 201 });
  }) as unknown as typeof fetch;
  return { fn, calls };
}

const props = {
  mode: 'explain' as const,
  prompt: '2x=4',
  reply: 'Хариу: 2',
  context: { kind: 'question' as const, id: 'a1' },
};

test('👍 sends an up rating and thanks the student', async () => {
  const f = fakeFetch();
  render(<FeedbackButtons {...props} fetchImpl={f.fn} />);
  fireEvent.click(screen.getByLabelText('Тусалсан'));
  await waitFor(() => expect(screen.getByText(/Баярлалаа/)).toBeTruthy());
  expect(f.calls[0]?.url).toBe('/api/tutor/feedback');
  expect(f.calls[0]?.body).toMatchObject({ rating: 'up', mode: 'explain', reply: 'Хариу: 2' });
});

test('👎 opens the box and sends the better explanation', async () => {
  const f = fakeFetch();
  render(<FeedbackButtons {...props} fetchImpl={f.fn} />);
  fireEvent.click(screen.getByLabelText('Тусалсангүй'));
  fireEvent.change(screen.getByRole('textbox'), { target: { value: ' Хоёр талыг 2-т хуваа. ' } });
  fireEvent.click(screen.getByText('Илгээх'));
  await waitFor(() => expect(screen.getByText(/Баярлалаа/)).toBeTruthy());
  expect(f.calls[0]?.body).toMatchObject({ rating: 'down', correction: 'Хоёр талыг 2-т хуваа.' });
});
