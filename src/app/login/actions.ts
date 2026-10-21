"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function translate(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Имэйл эсвэл нууц үг буруу байна.";
  if (m.includes("email not confirmed")) return "Имэйлээ баталгаажуулаагүй байна. Ирсэн захидлыг шалгана уу.";
  if (m.includes("already registered")) return "Энэ имэйлээр бүртгэл үүссэн байна. Нэвтэрнэ үү.";
  if (m.includes("password should be")) return "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой.";
  if (m.includes("rate limit")) return "Хэт олон оролдлого хийлээ. Түр хүлээгээд дахин оролдоно уу.";
  return msg;
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(translate(error.message))}`);
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback`, data: { full_name: fullName } },
  });
  if (error) redirect(`/login?mode=signup&error=${encodeURIComponent(translate(error.message))}`);
  if (data.session) redirect("/dashboard");
  redirect(`/login?message=${encodeURIComponent("Бүртгэл үүслээ! Имэйлээ шалгаж баталгаажуулаад нэвтэрнэ үү.")}`);
}
