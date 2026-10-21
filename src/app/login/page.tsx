import Link from "next/link";
import { CatIcon } from "@/components/Logo";
import { signIn, signUp } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; error?: string; message?: string }>;
}) {
  const { mode, error, message } = await searchParams;
  const isSignup = mode === "signup";

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-7 md:p-8">
        <div className="flex flex-col items-center text-center">
          <CatIcon size={56} />
          <h1 className="mt-4 font-display text-2xl font-black">{isSignup ? "Бүртгүүлэх" : "Тавтай морил!"}</h1>
          <p className="mt-1 text-sm text-ink/60">
            {isSignup ? "Хэдхэн секундэд бүртгэл үүсгээрэй." : "СууPrep-д нэвтэрч бэлтгэлээ үргэлжлүүлээрэй."}
          </p>
        </div>

        {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {message && <p className="mt-5 rounded-xl bg-brand-50 p-3 text-sm text-brand-800">{message}</p>}

        <form action={isSignup ? signUp : signIn} className="mt-6 space-y-3">
          {isSignup && (
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink/70">Нэр</span>
              <input name="full_name" className="input" placeholder="Болд" required />
            </label>
          )}
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink/70">Имэйл</span>
            <input name="email" type="email" className="input" placeholder="you@example.com" required />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink/70">Нууц үг</span>
            <input name="password" type="password" minLength={6} className="input" placeholder="••••••" required />
          </label>
          <button className="btn-primary w-full !py-3">{isSignup ? "Бүртгүүлэх" : "Нэвтрэх"}</button>
        </form>

        <p className="mt-5 text-center text-sm text-ink/60">
          {isSignup ? (
            <>
              Бүртгэлтэй юу?{" "}
              <Link href="/login" className="font-semibold text-brand-700 hover:underline">
                Нэвтрэх
              </Link>
            </>
          ) : (
            <>
              Бүртгэлгүй юу?{" "}
              <Link href="/login?mode=signup" className="font-semibold text-brand-700 hover:underline">
                Бүртгүүлэх
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
