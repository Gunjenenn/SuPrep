import { isSupabaseConfigured } from "@/lib/env";

export default function SetupPage() {
  const ai = (process.env.GEMINI_API_KEY ?? "").length > 10;
  const steps = [
    { done: isSupabaseConfigured, text: "Supabase төсөл үүсгээд NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_KEY-г .env.local-д бичих" },
    { done: false, text: "Supabase SQL Editor дээр supabase/schema.sql, дараа нь supabase/seed.sql-ийг ажиллуулах" },
    { done: ai, text: "Google AI Studio-оос GEMINI_API_KEY авч .env.local-д бичих" },
    { done: false, text: "Терминалд серверээ зогсоогоод дахин `npm run dev` ажиллуулах" },
  ];
  return (
    <div className="mx-auto max-w-2xl card p-8">
      <h1 className="font-display text-3xl font-black">Тохиргоо дутуу байна</h1>
      <p className="mt-2 text-ink/65">СууPrep ажиллахын тулд дараах алхмуудыг хийнэ үү (README.md-д дэлгэрэнгүй).</p>
      <ol className="mt-6 space-y-3">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3 rounded-xl bg-brand-50 p-4 text-sm">
            <span className={`mt-0.5 font-bold ${s.done ? "text-brand-600" : "text-ink/40"}`}>{s.done ? "✓" : i + 1}</span>
            <span>{s.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
