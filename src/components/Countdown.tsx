"use client";

import { useEffect, useState } from "react";

/** SAT өглөө 8:00 (Улаанбаатар) эхэлнэ гэж тооцно. */
export function Countdown({ date }: { date: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const target = new Date(`${date}T08:00:00+08:00`).getTime();
  const diff = now === null ? null : Math.max(0, target - now);
  const parts =
    diff === null
      ? ["–", "–", "–"]
      : [Math.floor(diff / 86400000), Math.floor((diff % 86400000) / 3600000), Math.floor((diff % 3600000) / 60000)];

  return (
    <div className="flex gap-2">
      {(["ӨДӨР", "ЦАГ", "МИН"] as const).map((label, i) => (
        <div key={label} className="w-[4.5rem] rounded-2xl bg-white/90 py-2.5 text-center shadow-sm ring-1 ring-brand-100">
          <div className="font-display text-2xl font-black tabular-nums">{parts[i]}</div>
          <div className="text-[10px] font-bold tracking-wider text-ink/50">{label}</div>
        </div>
      ))}
    </div>
  );
}
