// Fails when mn.json and en.json in the same folder don't have identical keys.
// Run: bun scripts/check-messages.ts   (part of `bun run check`)

import { dirname, join } from 'node:path';
import { Glob } from 'bun';

type Json = { [k: string]: string | Json };

export function keysOf(obj: Json, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'string' ? [prefix + k] : keysOf(v, `${prefix}${k}.`),
  );
}

export function diffKeys(a: Json, b: Json): { onlyA: string[]; onlyB: string[] } {
  const ka = new Set(keysOf(a));
  const kb = new Set(keysOf(b));
  return { onlyA: [...ka].filter((k) => !kb.has(k)), onlyB: [...kb].filter((k) => !ka.has(k)) };
}

async function checkFolder(mnPath: string): Promise<boolean> {
  const enPath = join(dirname(mnPath), 'en.json');
  const enFile = Bun.file(enPath);
  if (!(await enFile.exists())) {
    console.error(`✗ ${enPath} байхгүй`);
    return false;
  }
  const { onlyA, onlyB } = diffKeys(await Bun.file(mnPath).json(), await enFile.json());
  if (!onlyA.length && !onlyB.length) return true;
  console.error(`✗ ${dirname(mnPath)}`);
  for (const k of onlyA) console.error(`   зөвхөн mn: ${k}`);
  for (const k of onlyB) console.error(`   зөвхөн en: ${k}`);
  return false;
}

if (import.meta.main) {
  let bad = 0;
  for await (const mnPath of new Glob('src/**/mn.json').scan('.')) {
    if (!(await checkFolder(mnPath))) bad++;
  }
  if (bad) process.exit(1);
  console.log('✓ messages: mn ба en түлхүүрүүд таарч байна');
}
