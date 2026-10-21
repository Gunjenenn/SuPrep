// data/questions.json → supabase/seed.sql
// Ашиглах: npm run seed:build
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const questions = JSON.parse(readFileSync(join(root, "data/questions.json"), "utf8"));

const q = (v) => (v === null || v === undefined ? "null" : `'${String(v).replaceAll("'", "''")}'`);

const DOMAINS = ["algebra", "advanced_math", "problem_solving", "geometry_trig"];
const seen = new Set();
for (const item of questions) {
  if (seen.has(item.slug)) throw new Error(`Давхардсан slug: ${item.slug}`);
  seen.add(item.slug);
  if (!DOMAINS.includes(item.domain)) throw new Error(`${item.slug}: буруу domain`);
  if (item.type === "mcq" && (!Array.isArray(item.choices) || item.choices.length !== 4))
    throw new Error(`${item.slug}: mcq асуулт 4 сонголттой байх ёстой`);
  if (item.type === "mcq" && !["A", "B", "C", "D"].includes(item.answer))
    throw new Error(`${item.slug}: mcq хариулт A-D байх ёстой`);
}

const rows = questions.map(
  (x) =>
    `  (${q(x.slug)}, ${q(x.domain)}, ${q(x.skill)}, ${q(x.difficulty)}, ${q(x.type)}, ${q(x.prompt)}, ${
      x.choices ? `${q(JSON.stringify(x.choices))}::jsonb` : "null"
    }, ${q(x.answer)}, ${q(x.explanation)})`,
);

const sql = `-- АВТОМАТААР ҮҮСГЭСЭН: data/questions.json-оос (npm run seed:build)
-- Supabase → SQL Editor дээр schema.sql-ийн дараа ажиллуулна. Дахин ажиллуулахад аюулгүй.
insert into public.questions (slug, domain, skill, difficulty, type, prompt, choices, answer, explanation)
values
${rows.join(",\n")}
on conflict (slug) do update set
  domain = excluded.domain,
  skill = excluded.skill,
  difficulty = excluded.difficulty,
  type = excluded.type,
  prompt = excluded.prompt,
  choices = excluded.choices,
  answer = excluded.answer,
  explanation = excluded.explanation;
`;

writeFileSync(join(root, "supabase/seed.sql"), sql);
console.log(`seed.sql: ${questions.length} асуулт`);
