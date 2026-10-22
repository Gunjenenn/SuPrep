// H4 · SuuPrep questions → chat JSONL for a small-model LoRA fine-tune (Qwen2.5-1.5B-Instruct).
// Every question becomes several tutor conversations (hint, explain, desmos, translate, wrong-choice, check).
// Split by questionId so no question is in both train and val. Run: `bun ai/train/export.ts`
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { QUESTIONS } from '../../src/mocks/questions';
import type { Question } from '../../src/types';
import { type ChatExample, ChatExample as ChatExampleSchema, type EvalItem } from '../schema';

export const SYSTEM_PROMPT =
  'Чи бол "Суу" — монгол сурагчдад SAT Math заадаг эелдэг багш. Үргэлж монголоор, богино, ойлгомжтой хариул. ' +
  'Математикийг $…$ дотор бич. Сурагч зөвлөгөө (hint) асуувал эцсийн хариуг БҮҮ хэл — зөвхөн дараагийн алхмыг заа. ' +
  'Тайлбар асуувал алхам алхмаар бодоод, төгсгөлд "Хариу: …" гэж бич.';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export function answerText(q: Question): string {
  if (Array.isArray(q.answer)) return q.answer[0] ?? '';
  const letter = LETTERS[q.answer] ?? '?';
  return `${letter}) ${q.choices?.[q.answer] ?? ''}`.trim();
}

function questionBlock(q: Question): string {
  const lines = [q.prompt];
  if (q.choices) lines.push(...q.choices.map((c, i) => `${LETTERS[i]}) ${c}`));
  return lines.join('\n');
}

const ask = (q: Question, request: string) => `${questionBlock(q)}\n\n${request}`;

const HINT_ASKS = ['Зөвлөгөө өгөөч, хариуг нь битгий хэлээрэй.', 'Яаж эхлэхээ мэдэхгүй байна. Hint өгөх үү?'];
const EXPLAIN_ASKS = [
  'Алхам алхмаар тайлбарлаж өгөөч.',
  'Энэ бодлогыг яаж бодох вэ? Бүрэн тайлбар хэрэгтэй.',
];

function example(q: Question, mode: ChatExample['mode'], user: string, assistant: string): ChatExample {
  return ChatExampleSchema.parse({
    questionId: q.id,
    mode,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: user },
      { role: 'assistant', content: assistant },
    ],
  });
}

/** All tutor conversations for one question. */
export function examplesFor(q: Question): ChatExample[] {
  const out: ChatExample[] = [];
  const answer = answerText(q);

  for (const a of HINT_ASKS) out.push(example(q, 'hint', ask(q, a), q.hint));

  for (const a of EXPLAIN_ASKS)
    out.push(example(q, 'explain', ask(q, a), `${q.explain}\n\nХариу: ${answer}`));

  if (q.desmos) {
    const rows = q.desmos.rows.map((r) => `- \`${r}\``).join('\n');
    out.push(
      example(
        q,
        'desmos',
        ask(q, 'Үүнийг Desmos ашиглаад яаж бодох вэ?'),
        `Desmos-д эдгээрийг бич:\n${rows}\n\n${q.desmos.tip}`,
      ),
    );
  }

  if (q.mn || q.vocab?.length) {
    const parts: string[] = [];
    if (q.mn) parts.push(`Гол үг: ${q.mn}.`);
    if (q.vocab?.length) parts.push(`Анхаарах үгс: ${q.vocab.map((v) => `**${v}**`).join(', ')}.`);
    parts.push(`Асуулт юу асууж байна вэ гэвэл: ${q.hint}`);
    out.push(
      example(
        q,
        'translate',
        ask(q, 'Энэ асуултын англи үгсийг ойлгохгүй байна. Монголоор тайлбарлаач.'),
        parts.join(' '),
      ),
    );
  }

  if (q.why && q.choices) {
    for (const [idx, reason] of Object.entries(q.why)) {
      const i = Number(idx);
      const picked = `${LETTERS[i]}) ${q.choices[i]}`;
      out.push(
        example(
          q,
          'mistake',
          ask(q, `Би ${picked} гэж сонгосон. Яагаад буруу вэ?`),
          `${reason} Дахиад оролдоод үз: ${q.hint}`,
        ),
      );
    }
  }

  out.push(example(q, 'check', ask(q, `Миний хариу: ${answer}. Зөв үү?`), `Зөв! 🎉 ${q.explain}`));
  return out;
}

/** Deterministic split: every 6th question (by position) goes to val. */
export function split(questions: Question[]) {
  const val = questions.filter((_, i) => i % 6 === 5);
  const train = questions.filter((_, i) => i % 6 !== 5);
  return { train, val };
}

export function evalItems(questions: Question[]): EvalItem[] {
  return questions.flatMap((q) => [
    {
      questionId: q.id,
      mode: 'explain' as const,
      prompt: ask(q, EXPLAIN_ASKS[0]),
      answer: answerText(q),
      accepted: accepted(q),
    },
    {
      questionId: q.id,
      mode: 'hint' as const,
      prompt: ask(q, HINT_ASKS[0]),
      answer: answerText(q),
      accepted: accepted(q),
    },
  ]);
}

/** Strings that count as the correct final answer when checking model output. */
function accepted(q: Question): string[] {
  if (Array.isArray(q.answer)) return q.answer;
  const raw = (q.choices?.[q.answer] ?? '').replace(/\$/g, '');
  return [raw, `${LETTERS[q.answer]})`].filter(Boolean);
}

const toJsonl = (rows: unknown[]) => `${rows.map((r) => JSON.stringify(r)).join('\n')}\n`;

if (import.meta.main) {
  const outDir = join(import.meta.dir, '..', 'data', 'tuning');
  mkdirSync(outDir, { recursive: true });
  const { train, val } = split(QUESTIONS);
  const trainRows = train.flatMap(examplesFor);
  const valRows = val.flatMap(examplesFor);
  writeFileSync(join(outDir, 'train.jsonl'), toJsonl(trainRows));
  writeFileSync(join(outDir, 'val.jsonl'), toJsonl(valRows));
  writeFileSync(join(outDir, 'eval.jsonl'), toJsonl(evalItems(val)));
  console.log(
    `train: ${trainRows.length} examples (${train.length} questions) · val: ${valRows.length} (${val.length} questions) · eval: ${val.length * 2} prompts → ai/data/tuning/`,
  );
}
