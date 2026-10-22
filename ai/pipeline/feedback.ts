// H7 · Learning from users — safely.
// Students' 👍/👎 and better explanations (POST /api/tutor/feedback) NEVER go straight into training:
//   1. automatic checks: right answer for known questions, no answer in hints, Mongolian, no personal data, no injection
//   2. a human approves (or rejects) each row
//   3. approved rows → ai/data/tuning/feedback.jsonl → quick retrain in the notebook (MODE = "update")
//
//   bun ai/pipeline/feedback.ts                     list new feedback with check results
//   bun ai/pipeline/feedback.ts approve <id> …      approve rows that pass checks (--force to override)
//   bun ai/pipeline/feedback.ts reject <id> … --note "why"
//   bun ai/pipeline/feedback.ts export              approved rows → ai/data/tuning/feedback.jsonl
//
// Source: Supabase table tutor_feedback when NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set,
// otherwise the local dev inbox ai/data/feedback/inbox.jsonl (git-ignored).
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { QUESTIONS } from '../../src/mocks/questions';
import type { FeedbackRow } from '../../src/server/tutor/feedback';
import { buildUserMessage } from '../../src/server/tutor/ollama';
import type { ChatExample } from '../schema';
import { finalAnswer, mentionsAnswer } from './generate';

export type Check = { ok: boolean; trainable: boolean; text: string | null; reasons: string[] };

const LETTER = /\p{L}/u;
const CYRILLIC = /[Ѐ-ӿ]/;
const PII: [RegExp, string][] = [
  [/[^\s@]+@[^\s@]+\.[a-z]{2,}/i, 'имэйл хаяг байна'],
  [/https?:\/\/|www\./i, 'холбоос (URL) байна'],
  [/(?<!\d)(\+?976[\s-]?)?\d{4}[\s-]?\d{4}(?!\d)/, 'утасны дугаар байж магадгүй'],
  [/[А-ЯӨҮЁ]{2}\d{8}/u, 'регистрийн дугаар байна'],
];
const INJECTION = /ignore (all|previous|the above)|system prompt|you are now|өмнөх заавр|заавраа март/i;

/** Share of letters (outside $…$ math) that are Cyrillic. */
export function mongolianShare(text: string): number {
  const letters = [...text.replace(/\$[^$]*\$/g, '')].filter((c) => LETTER.test(c));
  if (letters.length < 10) return 1;
  return letters.filter((c) => CYRILLIC.test(c)).length / letters.length;
}

/** What the model should learn to say: the correction if given, else an up-voted reply. */
export function trainingText(row: FeedbackRow): string | null {
  if (row.correction?.trim()) return row.correction.trim();
  if (row.rating === 'up') return row.reply.trim();
  return null;
}

export function checkFeedback(row: FeedbackRow, seen = new Set<string>()): Check {
  const reasons: string[] = [];
  const text = trainingText(row);
  if (!text) {
    // 👎 without a better explanation: useful as a "hard case" for the team, but nothing to learn from yet
    return {
      ok: false,
      trainable: false,
      text: null,
      reasons: ['👎 — зөв тайлбар бичээгүй (багш нэмж бичих хэрэгтэй)'],
    };
  }
  if (text.length < 5) reasons.push('хэт богино');
  if (text.length > 1500) reasons.push('хэт урт');
  if (mongolianShare(text) < 0.5) reasons.push('ихэнх нь монгол биш');
  for (const [re, why] of PII) if (re.test(`${row.prompt}\n${text}`)) reasons.push(`хувийн мэдээлэл: ${why}`);
  if (INJECTION.test(`${row.prompt}\n${text}`)) reasons.push('заавар өөрчлөх оролдлого байж магадгүй');

  // answer key for questions we know
  const q = row.context_id ? QUESTIONS.find((x) => x.id === row.context_id) : undefined;
  if (q) {
    if (row.mode === 'explain' && !mentionsAnswer(q, text))
      reasons.push(`зөв хариу (${finalAnswer(q)}) тайлбарт алга`);
    if (row.mode === 'hint' && mentionsAnswer(q, text)) reasons.push('hint дотор хариу байна');
  }

  const key = `${row.mode}|${row.prompt.trim().toLowerCase()}|${text.toLowerCase()}`;
  if (seen.has(key)) reasons.push('давхардсан');
  seen.add(key);
  return { ok: reasons.length === 0, trainable: true, text, reasons };
}

export function toExample(row: FeedbackRow, system: string): ChatExample | null {
  const text = trainingText(row);
  if (!text) return null;
  return {
    questionId: `fb-${row.id}`,
    mode: 'feedback',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: buildUserMessage(row.mode, row.prompt) },
      { role: 'assistant', content: text },
    ],
  };
}

// ——— storage ———
type Status = FeedbackRow['status'];
export type Store = {
  load: () => Promise<FeedbackRow[]>;
  setStatus: (id: string, status: Status, note?: string) => Promise<void>;
};

const DIR = join(import.meta.dir, '..', 'data', 'feedback');

/** Dev store: inbox.jsonl (from the API) + decisions.jsonl (approve/reject log). Both git-ignored. */
export function localStore(dir = DIR): Store {
  const inbox = join(dir, 'inbox.jsonl');
  const decisions = join(dir, 'decisions.jsonl');
  const read = (p: string) =>
    existsSync(p)
      ? readFileSync(p, 'utf8')
          .split('\n')
          .filter(Boolean)
          .map((l) => JSON.parse(l))
      : [];
  return {
    load: async () => {
      const latest = new Map<string, Status>();
      for (const d of read(decisions)) latest.set(d.id, d.status);
      return (read(inbox) as FeedbackRow[]).map((r) => ({ ...r, status: latest.get(r.id) ?? r.status }));
    },
    setStatus: async (id, status, note) => {
      mkdirSync(dir, { recursive: true });
      appendFileSync(
        decisions,
        `${JSON.stringify({ id, status, note: note ?? null, at: new Date().toISOString() })}\n`,
      );
    },
  };
}

export function supabaseStore(url: string, serviceKey: string): Store {
  const db = createClient(url, serviceKey, { auth: { persistSession: false } });
  return {
    load: async () => {
      const { data, error } = await db.from('tutor_feedback').select('*').order('created_at');
      if (error) throw error;
      return (data ?? []) as FeedbackRow[];
    },
    setStatus: async (id, status, note) => {
      const { error } = await db
        .from('tutor_feedback')
        .update({ status, review_note: note ?? null, reviewed_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
  };
}

function defaultStore(): Store {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? supabaseStore(url, key) : localStore();
}

const short = (id: string) => id.slice(0, 8);

export async function runCli(argv: string[], store = defaultStore(), outFile?: string): Promise<string[]> {
  const log: string[] = [];
  const [cmd = 'review', ...rest] = argv;
  const force = rest.includes('--force');
  const noteAt = rest.indexOf('--note');
  const note = noteAt >= 0 ? rest[noteAt + 1] : undefined;
  const ids = rest.filter((a, i) => !a.startsWith('--') && !(noteAt >= 0 && i === noteAt + 1));
  const rows = await store.load();
  const seen = new Set<string>();
  const checked = rows.map((r) => ({ r, c: checkFeedback(r, seen) }));
  const find = (prefix: string) => checked.filter(({ r }) => r.id.startsWith(prefix));

  if (cmd === 'review') {
    const fresh = checked.filter(({ r }) => r.status === 'new');
    log.push(
      `${fresh.length} шинэ санал (${rows.length} нийт, ${rows.filter((r) => r.status === 'approved').length} батлагдсан)`,
    );
    for (const { r, c } of fresh) {
      const mark = c.ok ? '✓ OK   ' : c.trainable ? '✗ CHECK' : '… HARD ';
      log.push(
        `${mark} ${short(r.id)}  ${r.rating === 'up' ? '👍' : '👎'} ${r.mode.padEnd(9)} ${r.context_id ?? '-'}  ${c.reasons.join('; ')}`,
      );
    }
    log.push('Батлах: approve <id> · Татгалзах: reject <id> --note "…" · Сургалтын файл: export');
  } else if (cmd === 'approve' || cmd === 'reject') {
    for (const id of ids) {
      const matches = find(id);
      if (matches.length !== 1) {
        log.push(`${id}: ${matches.length === 0 ? 'олдсонгүй' : 'олон мөр таарч байна — урт id өг'}`);
        continue;
      }
      const { r, c } = matches[0] as (typeof checked)[number];
      if (cmd === 'approve' && !c.trainable) {
        log.push(`${short(r.id)}: сургах текст алга — батлах боломжгүй`);
        continue;
      }
      if (cmd === 'approve' && !c.ok && !force) {
        log.push(`${short(r.id)}: шалгалт унасан (${c.reasons.join('; ')}). Итгэлтэй бол --force`);
        continue;
      }
      await store.setStatus(r.id, cmd === 'approve' ? 'approved' : 'rejected', note);
      log.push(`${short(r.id)}: ${cmd === 'approve' ? 'батлагдлаа' : 'татгалзлаа'}`);
    }
  } else if (cmd === 'export') {
    const { SYSTEM_PROMPT } = await import('../train/export');
    const examples = checked
      .filter(({ r }) => r.status === 'approved')
      .map(({ r }) => toExample(r, SYSTEM_PROMPT))
      .filter((x): x is ChatExample => x !== null);
    const out = outFile ?? join(import.meta.dir, '..', 'data', 'tuning', 'feedback.jsonl');
    writeFileSync(out, examples.map((e) => JSON.stringify(e)).join('\n') + (examples.length ? '\n' : ''));
    log.push(`${examples.length} батлагдсан жишээ → ${out.replace(`${process.cwd()}/`, '')}`);
  } else {
    log.push(`Үл мэдэх команд: ${cmd}`);
  }
  return log;
}

if (import.meta.main) {
  for (const line of await runCli(process.argv.slice(2))) console.log(line);
}
