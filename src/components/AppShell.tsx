import type { User } from "@supabase/supabase-js";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "./Sidebar";

export async function AppShell({ user, children }: { user: User; children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
  const name = (data as unknown as { full_name: string | null } | null)?.full_name || user.email?.split("@")[0] || "Сурагч";

  return (
    <div className="min-h-screen bg-forest">
      <Suspense>
        <Sidebar name={name} />
      </Suspense>
      <div className="lg:py-3 lg:pl-64 lg:pr-3">
        <main className="relative min-h-[calc(100vh-1.5rem)] overflow-hidden bg-paper lg:rounded-[1.75rem]">
          <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">{children}</div>
          <footer className="relative mx-auto max-w-6xl px-4 pb-8 text-xs text-ink/40 md:px-8">
            SAT нь College Board-ийн бүртгэлтэй барааны тэмдэг бөгөөд СууPrep-тэй холбоогүй.
          </footer>
        </main>
      </div>
    </div>
  );
}
