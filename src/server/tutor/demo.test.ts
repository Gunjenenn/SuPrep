import { expect, test } from 'bun:test';
import { demoReply } from './demo';

test('every mode has a Mongolian demo reply', () => {
  for (const m of ['hint', 'explain', 'desmos', 'similar', 'translate'] as const)
    expect(demoReply(m).length).toBeGreaterThan(20);
});
