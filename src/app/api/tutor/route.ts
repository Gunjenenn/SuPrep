import { streamText } from "ai";
import { z } from "zod";
import { AI_NOT_CONFIGURED, geminiModel, isAIConfigured } from "@/lib/ai";
import { LETTERS } from "@/lib/domains";
import { createClient } from "@/lib/supabase/server";
import { consumeAIQuota, quotaMessage } from "@/lib/usage";

export const maxDuration = 60;

const Body = z.object({
  questionId: z.string().uuid().optional(),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .min(1)
    .max(30),
  selected: z.string().max(20).optional(),
  wasCorrect: z.boolean().optional(),
});

type Ctx = {
  prompt: string;
  choices: string[] | null;
  type: "mcq" | "spr";
  domain: string;
  skill: string;
  difficulty: string;
  attempted: boolean;
  answer: string | null;
  explanation: string | null;
};

const SYSTEM = `Чи бол "СууPrep" сайтын SAT математикийн AI багш, нэр чинь "Суу" (хар муур 🐈‍⬛).

Дүрэм:
- Үргэлж МОНГОЛ хэлээр, найрсаг, товч (ихэвчлэн 2–6 өгүүлбэр) хариул.
- Математикийн бүх томьёог KaTeX-ээр бич: мөр доторх нь $...$, тусдаа мөр нь $$...$$.
- Сократын аргаар заа: эхлээд сэжүүр, дараагийн алхмыг сурагчаар бодуулах асуулт тавь.
- Сурагч хариултаа ШАЛГААГҮЙ бол зөв хариултыг (үсэг, тоо) ХЭЗЭЭ Ч шууд бүү хэл, бүтэн бодолт бүү бич — зөвхөн сэжүүр, арга зам.
- Сурагч хариултаа шалгасан бол "албан ёсны тайлбар"-т тулгуурлан алхам алхмаар тайлбарлаж болно. Албан ёсны хариулттай зөрчилдөх дүгнэлт бүү гарга.
- Сурагч буруу хариулсан бол ямар алдаа гаргасныг таамаглаж, ойлгомжтой тайлбарла.
- "Ижил төстэй бодлого" хүсвэл тоог нь өөрчилсөн шинэ бодлого зохиож, хариуг нь шууд бүү хэл.
- SAT математиктай холбоогүй сэдвээр асуувал эелдэгээр буцааж бодлого руу чиглүүл.`;

export async function POST(req: Request) {
  if (!isAIConfigured()) return Response.json({ error: AI_NOT_CONFIGURED }, { status: 500 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Буруу хүсэлт." }, { status: 400 });
  const { questionId, messages, selected, wasCorrect } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Нэвтэрнэ үү." }, { status: 401 });

  const quota = await consumeAIQuota(supabase, "tutor");
  if (!quota.ok) return Response.json({ error: quotaMessage("tutor") }, { status: 429 });

  let context = `## Горим: Ерөнхий асуулт
Сурагч тодорхой асуулт дээр биш, ерөнхий SAT математикийн асуулт асууж байна. Ойлголтыг жишээгээр тайлбарла. Сурагч өөрийн бодлогоо илгээвэл шууд хариу хэлэхээс өмнө эхлээд сэжүүр өгч, оролдуул.`;

  if (questionId) {
    const { data: ctxData } = await supabase.rpc("get_question_context", { p_question_id: questionId });
    const ctx = ctxData as unknown as Ctx | null;
    if (!ctx) return Response.json({ error: "Асуулт олдсонгүй." }, { status: 404 });

    const choices =
      ctx.type === "mcq" && ctx.choices
        ? ctx.choices.map((c, i) => `${LETTERS[i]}) ${c}`).join("\n")
        : "(Өөрөө бичих хариулттай)";

    context = [
      `## Одоогийн асуулт`,
      `Чиглэл: ${ctx.domain} · Ур чадвар: ${ctx.skill} · Түвшин: ${ctx.difficulty}`,
      ``,
      ctx.prompt,
      ``,
      `Сонголтууд:`,
      choices,
      ``,
      ctx.attempted
        ? [
            `Сурагч хариултаа шалгасан.`,
            selected ? `Сурагчийн хариулт: ${selected} (${wasCorrect ? "ЗӨВ" : "БУРУУ"})` : "",
            `Албан ёсны зөв хариулт: ${ctx.answer?.split("|")[0]}`,
            `Албан ёсны тайлбар: ${ctx.explanation}`,
          ].join("\n")
        : `Сурагч хариултаа ХАРААХАН ШАЛГААГҮЙ. Зөв хариултыг бүү хэл.`,
    ].join("\n");
  }

  const result = streamText({
    model: geminiModel(),
    system: `${SYSTEM}\n\n${context}`,
    messages: messages
      .slice(-12)
      .map((m) =>
        m.role === "user" ? { role: "user" as const, content: m.content } : { role: "assistant" as const, content: m.content },
      ),
    temperature: 0.4,
    onError: ({ error }) => console.error("[tutor] AI error:", error),
  });

  return result.toTextStreamResponse();
}
