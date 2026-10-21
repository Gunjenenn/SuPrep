import Link from "next/link";
import { redirect } from "next/navigation";
import { CatIcon } from "@/components/Logo";
import { getOptionalUser } from "@/lib/auth";
import { DOMAINS } from "@/lib/domains";

const FEATURES = [
  {
    title: "AI багш «Суу»",
    body: "Асуулт бүрийн хажууд монголоор ярьдаг багш. Шууд хариу хэлэхгүй — эхлээд сэжүүр өгч, өөрөөр чинь бодуулна.",
    icon: "💬",
  },
  {
    title: "AI сургалтын төлөвлөгөө",
    body: "Шалгалтын өдөр, зорилтот оноо, сул талд чинь тулгуурлан 4 долоо хоногийн өдөр тутмын төлөвлөгөө гаргана.",
    icon: "🗓️",
  },
  {
    title: "AI шинжилгээ",
    body: "Ур чадвар бүрийн зөв хувь, хугацааг тооцоолж, юун дээр анхаарахыг монголоор тайлбарлана.",
    icon: "📈",
  },
  {
    title: "Жинхэнэ шалгалт шиг",
    body: "Хугацаатай тест, Desmos график тооны машин, олон сонголттой ба өөрөө бичих хариулттай асуултууд.",
    icon: "⏱️",
  },
];

export default async function Home() {
  const user = await getOptionalUser();
  if (user) redirect("/dashboard");

  return (
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-3xl bg-ink px-6 py-14 text-white md:px-12 md:py-20">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-brand-600/40 blur-3xl" />
        <div className="relative grid items-center gap-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <span className="chip border-brand-400/40 bg-brand-500/15 text-brand-200">Digital SAT · Math</span>
            <h1 className="mt-4 font-display text-4xl font-black leading-tight md:text-6xl">
              SAT математикийг <span className="text-brand-400">монгол хэлээр</span>, AI багштайгаар.
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/70 md:text-lg">
              СууPrep нь Монгол сурагчдад зориулсан SAT математикийн бэлтгэл. Дасгал хий, алдаагаа ойлго, оноогоо
              өсгө.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login?mode=signup" className="btn-primary !px-6 !py-3 text-base">
                Үнэгүй эхлэх
              </Link>
              <Link href="/login" className="btn !border !border-white/20 !px-6 !py-3 text-base text-white hover:bg-white/10">
                Нэвтрэх
              </Link>
            </div>
          </div>
          <div className="mx-auto">
            <div className="rotate-3 rounded-[2.5rem] bg-brand-600 p-3 shadow-2xl shadow-brand-900/50">
              <CatIcon size={220} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="card p-5">
            <div className="text-2xl">{f.icon}</div>
            <h3 className="mt-3 font-display text-lg font-extrabold">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink/65">{f.body}</p>
          </div>
        ))}
      </section>

      <section className="card p-6 md:p-8">
        <h2 className="font-display text-2xl font-black">SAT математикийн 4 чиглэл</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DOMAINS.map((d) => (
            <div key={d.id} className="rounded-xl bg-brand-50 p-4">
              <div className="font-display text-2xl font-black text-brand-700">{d.emoji}</div>
              <div className="mt-2 text-sm font-bold">{d.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
