import { expect, test } from 'bun:test';
import { allowedSources } from './ingest';

test('only allowed sources are ingested', () => {
  expect(allowedSources().map((s) => s.id)).toEqual(['suuprep-original']);
});
