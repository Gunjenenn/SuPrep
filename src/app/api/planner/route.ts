import { generateObject } from "ai";
import { z } from "zod";
import { AI_NOT_CONFIGURED, geminiModel, isAIConfigured } from "@/lib/ai";
import { getUserStats, statsForAI } from "@/lib/stats";
import { createClient } from "@/lib/supabase/server";
import { consumeAIQuota, quotaMessage } from "@/lib/usage";

export const maxDuration = 60;

const Body = z.object({
  testDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  targetScore: z.number().int().min(200).max(800),
  hoursPerWeek: z.number().int().min(1).max(40),
  notes: z.string().max(500).optional(),
});

const PlanSchema = z.object({
  summary: z.string().describe("Төлөвлөгөөний товч тайлбар, 2-3 өгүүлбэр, монголоор"),
  weeks: z
    .array(
      z.object({
        week: z.number().describe("Долоо хоногийн дугаар, 1-ээс эхэлнэ"),
        focus: z.string().describe("Энэ долоо хоногийн гол анхаарах зүйл"),
        days: z.array(
          z.object({
            day: z.string().describe("Гарагийн нэр: Даваа, Мягмар, Лхагва, Пүрэв, Баасан, Бямба, Ням"),
            tasks: z.array(
              z.object({
                skill: z.string().describe("Ур чадварын нэр"),
                activity: z.string().describe("Юу хийх вэ, товч"),
                questions: z.number().describe("Бодох асуултын тоо"),
                minutes: z.number().describe("Зарцуулах минут"),
              }),
            ),
          }),
        ),
      }),
    )
    .describe("Ирэх 4 долоо хоног (эсвэл шалгалт хүртэлх хугацаа)"),
  tips: z.array(z.string()).describe("3-5 практик зөвлөгөө"),
});

const SKILLS = [
  "Нэг хувьсагчтай шугаман тэгшитгэл",
  "Шугаман функц",
  "Хоёр хувьсагчтай шугаман тэгшитгэл",
  "Шугаман тэгшитгэлийн систем",
  "Шугаман тэнцэтгэл биш",
  "Тэнцүү илэрхийлэл",
  "Шугаман бус тэгшитгэл",
  "Шугаман бус тэгшитгэлийн систем",
  "Шугаман бус функц",
  "Харьцаа, хурд, пропорц",
  "Хувь",
  "Нэг хувьсагчтай өгөгдөл",
  "Хоёр хувьсагчтай өгөгдөл",
  "Магадлал",
  "Статистик дүгнэлт",
  "Талбай ба эзлэхүүн",
  "Шулуун, өнцөг, гурвалжин",
  "Тэгш өнцөгт гурвалжин ба тригонометр",
  "Тойрог",
];

export async function POST(req: Request) {
  if (!isAIConfigured()) return Response.json({ error: AI_NOT_CONFIGURED }, { status: 500 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Мэдээллээ бүрэн оруулна уу." }, { status: 400 });
  const input = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Нэвтэрнэ үү." }, { status: 401 });

  const quota = await consumeAIQuota(supabase, "planner");
  if (!quota.ok) return Response.json({ error: quotaMessage("planner") }, { status: 429 });

  await supabase
    .from("profiles")
    .update({ test_date: input.testDate, target_score: input.targetScore, hours_per_week: input.hoursPerWeek })
    .eq("id", user.id);

  const stats = await getUserStats(supabase);
  const today = new Date().toISOString().slice(0, 10);
  const daysLeft = Math.max(1, Math.round((new Date(input.testDate).getTime() - Date.now()) / 86400000));

  try {
    const { object } = await generateObject({
      model: geminiModel(),
      schema: PlanSchema,
      temperature: 0.5,
      system:
        "Чи бол SAT математикийн бэлтгэлийн зөвлөх. Монгол сурагчид зориулж бодитой, хэрэгжихүйц сургалтын төлөвлөгөө гаргана. Бүх текст монгол хэлээр. Сул ур чадварт илүү их цаг хуваарил, гэхдээ давуу талаа ч давтуул. Долоо хоногийн нийт цаг сурагчийн боломжит цагаас хэтрэхгүй. Долоо хоног бүрт 1 амралтын өдөр үлдээ. Долоо хоног бүрийн сүүлд 'Хугацаатай тест' даалгавар оруул.",
      prompt: `Өнөөдөр: ${today}
SAT шалгалтын өдөр: ${input.testDate} (${daysLeft} өдрийн дараа)
Зорилтот математикийн оноо: ${input.targetScore} / 800
Долоо хоногт зарцуулах цаг: ${input.hoursPerWeek}
Сурагчийн тэмдэглэл: ${input.notes || "(байхгүй)"}

Сурагчийн статистик (кодоор тооцоолсон, бодит):
${JSON.stringify(statsForAI(stats), null, 2)}

Боломжит ур чадварууд: ${SKILLS.join("; ")}

${stats.total < 10 ? "Сурагч хараахан цөөн асуулт бодсон тул эхний долоо хоногт бүх чиглэлээс оношлох дасгал хийлгэ." : ""}
Ирэх ${Math.min(4, Math.ceil(daysLeft / 7))} долоо хоногийн төлөвлөгөө гарга.`,
    });

    await supabase.from("study_plans").insert({ plan: object });
    return Response.json({ plan: object, remaining: quota.remaining });
  } catch (e) {
    console.error("[planner] AI error:", e);
    return Response.json({ error: "AI төлөвлөгөө гаргаж чадсангүй. Дахин оролдоно уу." }, { status: 502 });
  }
}
