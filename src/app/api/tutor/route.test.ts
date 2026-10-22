import { expect, test } from 'bun:test';
import { POST } from './route';

const call = (body: unknown) =>
  POST(new Request('http://x/api/tutor', { method: 'POST', body: JSON.stringify(body) }));

test('demo reply, labelled as demo', async () => {
  const res = await call({ mode: 'desmos', message: 'тусла' });
  expect(res.status).toBe(200);
  expect(await res.json()).toMatchObject({ demo: true });
});

test('400 on bad body', async () => {
  expect((await call({ message: '' })).status).toBe(400);
});
