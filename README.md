# СууPrep 🐈‍⬛

SAT математикийн бэлтгэлийг **монгол хэлээр**, AI багштайгаар.

- **Дасгал**: асуултын сан (чиглэл, түвшин, бодоогүй/буруу гэж шүүнэ), KaTeX томьёо, Desmos тооны машин
- **AI багш «Суу»**: асуулт бүрийн хажууд. Хариулахаас өмнө зөвхөн сэжүүр, хариулсны дараа алхам алхмаар тайлбар
- **Хугацаатай тест**: 12 асуулт, асуулт бүрт ~95 сек, 4 чиглэлээс тэнцүү
- **AI төлөвлөгөө**: шалгалтын өдөр, зорилго, сул тал дээр тулгуурласан 4 долоо хоногийн төлөвлөгөө
- **AI шинжилгээ**: тоог кодоор тооцож, AI зөвхөн дүгнэлт, зөвлөгөө бичнэ

Stack: Next.js 15 (App Router, TypeScript) · Tailwind v4 · Supabase (Auth + Postgres) · Gemini (Vercel AI SDK)

---

## Эхлүүлэх (1 удаа)

### 1. Сангуудыг суулгах

```bash
cd ~/Documents/suuprep
npm install
```

### 2. Supabase

1. https://supabase.com дээр **New project** үүсгэнэ. Бүс: **Northeast Asia (Tokyo)** эсвэл **Southeast Asia (Singapore)**.
2. **SQL Editor → New query**: `supabase/schema.sql`-ийг бүтнээр хуулж **Run** дарна.
3. Дахин **New query**: `supabase/seed.sql`-ийг хуулж **Run** дарна (32 асуулт нэмэгдэнэ).
4. **Project Settings → API Keys**: **Project URL** ба **Publishable key**-г (эсвэл legacy **anon** key) хуулна.
5. **Authentication → URL Configuration**: Site URL = `http://localhost:3000`, Redirect URLs-д `http://localhost:3000/auth/callback`-ийг нэмнэ.
6. (Заавал биш) Хөгжүүлэлтийн үед **Authentication → Sign In / Providers → Email → Confirm email**-ийг унтраавал имэйл баталгаажуулалгүйгээр шууд нэвтэрнэ.

### 3. Gemini API key

https://aistudio.google.com → **Get API key** → **Create API key**.

### 4. `.env.local`

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=sb_publishable_...
GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-2.5-flash
```

### 5. Ажиллуулах

```bash
npm run dev
```

http://localhost:3000 → Бүртгүүлэх → Дасгал.

---

## Асуулт нэмэх

1. `data/questions.json`-д асуулт нэмнэ (`slug` давтагдахгүй).
   - `type: "mcq"`: `choices`-д яг 4 сонголт, `answer` нь `"A"`–`"D"`
   - `type: "spr"`: `choices: null`, `answer`-т хүлээн авах хариултуудыг `|`-ээр тусгаарлана, ж: `"3/4|0.75|.75"`
   - Томьёог `$...$`-аар бичнэ (KaTeX)
2. `npm run seed:build` → `supabase/seed.sql` шинэчлэгдэнэ
3. Supabase SQL Editor-т `seed.sql`-ийг дахин ажиллуулна (давхардахгүй, шинэчилнэ)

> ⚠️ Асуултууд эх (original) байх ёстой. College Board-ийн болон бусад сайтын асуултыг хуулж болохгүй (зохиогчийн эрх).

## Аюулгүй байдал

- Хариулт, тайлбар хөтөч рүү очдоггүй: `questions.answer` / `explanation` баганыг `authenticated` эрхээр уншиж болохгүй. Шалгалтыг `submit_answer()` SQL функц хийнэ.
- AI багш хариулж үзээгүй асуултын хариуг авдаггүй (`get_question_context()`).
- AI хүсэлтэд хэрэглэгч тус бүрд 24 цагийн хязгаар бий: `src/lib/usage.ts` (tutor 40, planner 5, analysis 10).
- Gemini key зөвхөн сервер дээр (`NEXT_PUBLIC_` угтваргүй).

## Анхаарах

- **Gemini free tier**: хүсэлтийн хязгаар бага, илгээсэн өгөгдлийг Google бүтээгдэхүүнээ сайжруулахад ашиглаж магадгүй. Бодит сурагчидтай ажиллахын өмнө paid tier руу шилжихийг зөвлөж байна. Загвар солих: `.env.local`-ийн `GEMINI_MODEL`. Claude руу шилжих бол `src/lib/ai.ts`-д `@ai-sdk/anthropic` ашиглана.
- **Desmos**: одоо Desmos-ийн туршилтын (demo) key ашиглаж байна. Олон нийтэд нээхийн өмнө https://www.desmos.com/api дээрээс өөрийн key авна.
- **Төлбөр (QPay)**: хараахан хийгээгүй.

## Бүтэц

```
src/
  app/
    page.tsx              нүүр хуудас
    login/                нэвтрэх, бүртгүүлэх
    dashboard/            самбар
    practice/             асуултын сан + [id] асуулт бодох (AI багш, Desmos)
    test/                 хугацаатай тест
    planner/              AI төлөвлөгөө
    analysis/             AI шинжилгээ
    api/tutor|planner|analysis   Gemini дуудлагууд (сервер)
  components/             UI
  lib/                    supabase, ai, stats, usage
supabase/schema.sql       хүснэгт, RLS, функцууд
supabase/seed.sql         асуултууд (data/questions.json-оос)
```
