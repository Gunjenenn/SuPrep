# ai/ — Section H

Суугийн fine-tune хийх өгөгдөл, сургалт, үнэлгээ. Апп-тай нэг repo, нэг `bun install`.

```
ai/
  schema.ts                zod: SourceQuestion, Dialogue, TuningExample (H2–H4 өргөтгөнө)
  data/sources.json        эх сурвалж + лиценз (H1). Түүхий файл → ai/data/raw/ (git-д орохгүй)
  pipeline/ingest.ts       PDF/HTML/CSV → SourceQuestion[]   (H2: pdfjs-dist, cheerio)
  pipeline/build-dialogues.ts  асуулт → 4–6 монгол яриа         (H3: @google/genai)
  train/export.ts          → ai/out/train.jsonl, val.jsonl    (H4)
  train/tune.ts            Vertex AI supervised tuning job    (H4)
  eval/run.ts              → ai/out/eval_report.md            (H5)
```

## Суу fine-tune (жижиг модель) — одоо ажиллаж байгаа зам

**Qwen2.5-1.5B-Instruct + LoRA**, Colab T4 дээр сургаж, Ollama-аар ажиллуулна.

1. `bun ai/train/export.ts` → `ai/data/tuning/train.jsonl` (176), `val.jsonl` (34), `eval.jsonl` (10).
   32 асуулт бүрээс 5–7 яриа: hint, explain, desmos, translate, буруу сонголт, шалгах. Train/val асуултаар хуваагдсан.
2. `ai/train/suu_finetune.ipynb`-ийг Colab-д нээж (T4 GPU) **Run all** → base vs fine-tuned үнэлгээ
   (`eval_report.md`: хариу зөв %, hint leak %, монгол %) → `suu.zip` (GGUF + Modelfile) татна.
3. Laptop дээр: `cd suu && ollama create suu -f Modelfile`
4. `.env.local`: `OLLAMA_URL=http://localhost:11434`, `OLLAMA_MODEL=suu` → `/api/tutor` Суу-г ашиглана
   (`demo: false`). Ollama унтарсан үед демо хариу руу буцна.

Сургалтын system prompt (`export.ts`) ба апп-ийн prompt (`src/server/tutor/ollama.ts`) ижил байх ёстой — тест шалгана.
Notebook нь цорын ганц Python хэсэг (GPU сургалтад Unsloth хэрэгтэй).

Ажиллуулах: `bun run ai:build` · `bun run ai:eval` · тест `bun test ai`.

Математик шалгалт B хэсгийн `src/features/desmos/lib/expr.ts`-ийг шууд import хийнэ (B1 дууссаны дараа).

**Лиценз:** College Board-ын материал (Bluebook practice test, Question Bank) зохиогчийн эрхтэй.
H1 дээр ашиглах нөхцөлийг шалгаж, зөвшөөрөлгүй эх сурвалжийг `allowed: false` болгоно —
`ingest.ts` ийм эх сурвалжийг уншихгүй.
