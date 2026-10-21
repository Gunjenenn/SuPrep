import { generateText } from "ai";
import { AI_NOT_CONFIGURED, geminiModel, isAIConfigured } from "@/lib/ai";
import { getUserStats, statsForAI } from "@/lib/stats";
import { createClient } from "@/lib/supabase/server";
import { consumeAIQuota, quotaMessage } from "@/lib/usage";

export const maxDuration = 60;

export async function POST() {
  if (!isAIConfigured()) return Response.json({ error: AI_NOT_CONFIGURED }, { status: 500 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Нэвтэрнэ үү." }, { status: 401 });

  const stats = await getUserStats(supabase);
  if (stats.total < 5) {
    return Response.json({ error: "Шинжилгээ хийхэд дор хаяж 5 асуулт бодсон байх хэрэгтэй." }, { status: 400 });
  }

  const quota = await consumeAIQuota(supabase, "analysis");
  if (!quota.ok) return Response.json({ error: quotaMessage("analysis") }, { status: 429 });

  try {
    const { text } = await generateText({
      model: geminiModel(),
      temperature: 0.4,
      system:
        "Чи бол SAT математикийн бэлтгэлийн шинжээч багш Суу. Монгол хэлээр, урам өгөхүйц боловч шударга бич. Зөвхөн өгөгдсөн статистикийн тоог ашигла — шинэ тоо бүү зохио, бүү тооцоол. Markdown ашигла (## гарчиг, жагсаалт). Нийт 180–300 үг.",
      prompt: `Сурагчийн статистик (кодоор тооцоолсон):
${JSON.stringify(statsForAI(stats), null, 2)}

Дараах бүтэцтэй тайлан бич:
## Ерөнхий дүгнэлт
## Давуу тал
## Анхаарах ур чадварууд (хамгийн сул 2–3, яагаад чухал вэ)
## Дараагийн 7 хоногийн алхам (3–5 тодорхой алхам)
Хэрэв цөөн асуулт бодсон бол (<30) дүгнэлт урьдчилсан гэдгийг дурд. Хугацааны хувьд SAT-д асуулт бүрт ойролцоогоор 95 секунд байдгийг харгалз.`,
    });
    return Response.json({ text, remaining: quota.remaining });
  } catch (e) {
    console.error("[analysis] AI error:", e);
    return Response.json({ error: "AI шинжилгээ хийж чадсангүй. Дахин оролдоно уу." }, { status: 502 });
  }
}
