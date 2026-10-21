"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Icon, type IconName } from "./Icons";
import { Logo } from "./Logo";

type Item = { href: string; label: string; icon: IconName; match: (path: string, status: string | null) => boolean };

const MAIN: Item[] = [
  { href: "/dashboard", label: "Нүүр", icon: "home", match: (p) => p === "/dashboard" },
  { href: "/tutor", label: "AI багш Суу", icon: "chat", match: (p) => p === "/tutor" },
  { href: "/planner", label: "Сургалтын төлөвлөгөө", icon: "calendar", match: (p) => p === "/planner" },
  { href: "/analysis", label: "Шинжилгээ", icon: "chart", match: (p) => p === "/analysis" },
  {
    href: "/practice?status=wrong",
    label: "Алдаанууд",
    icon: "bookmark",
    match: (p, s) => p === "/practice" && s === "wrong",
  },
];

const PRACTICE: Item[] = [
  {
    href: "/practice",
    label: "Асуултын сан",
    icon: "list",
    match: (p, s) => p.startsWith("/practice") && s !== "wrong",
  },
  { href: "/test", label: "Хугацаатай тест", icon: "timer", match: (p) => p === "/test" },
];

function NavLink({ item, active }: { item: Item; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition ${
        active ? "bg-white text-ink shadow-sm" : "text-white/75 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon name={item.icon} className={`h-5 w-5 ${active ? "text-brand-600" : ""}`} />
      {item.label}
    </Link>
  );
}

export function Sidebar({ name }: { name: string }) {
  const path = usePathname();
  const status = useSearchParams().get("status");

  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col px-3 py-5 text-white lg:flex">
        <Link href="/dashboard" className="px-2">
          <Logo size={36} light />
        </Link>
        <nav className="mt-7 space-y-1">
          {MAIN.map((i) => (
            <NavLink key={i.href} item={i} active={i.match(path, status)} />
          ))}
        </nav>
        <div className="mt-7 px-3 text-xs font-bold tracking-[0.12em] text-white/45">ДАСГАЛ</div>
        <nav className="mt-2 space-y-1">
          {PRACTICE.map((i) => (
            <NavLink key={i.href} item={i} active={i.match(path, status)} />
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-500 font-display font-black text-ink">
            {name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 truncate font-semibold">{name}</div>
          <form action="/auth/signout" method="post">
            <button title="Гарах" className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white">
              <Icon name="logout" />
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile */}
      <div className="sticky top-0 z-30 bg-forest text-white lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard">
            <Logo size={30} light />
          </Link>
          <form action="/auth/signout" method="post">
            <button className="rounded-lg p-1.5 text-white/70" title="Гарах">
              <Icon name="logout" />
            </button>
          </form>
        </div>
        <nav className="flex gap-1.5 overflow-x-auto px-3 pb-3">
          {[...MAIN, ...PRACTICE].map((i) => {
            const active = i.match(path, status);
            return (
              <Link
                key={i.href}
                href={i.href}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  active ? "bg-white text-ink" : "bg-white/10 text-white/80"
                }`}
              >
                <Icon name={i.icon} className="h-4 w-4" />
                {i.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
