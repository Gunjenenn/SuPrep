"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { DESMOS_API_KEY } from "@/lib/env";

type DesmosApi = {
  GraphingCalculator: (el: HTMLElement, opts?: Record<string, unknown>) => { destroy: () => void };
};

declare global {
  interface Window {
    Desmos?: DesmosApi;
  }
}

export function DesmosCalculator({ height = 440 }: { height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.Desmos) setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !ref.current || !window.Desmos) return;
    const calc = window.Desmos.GraphingCalculator(ref.current, {
      keypad: true,
      expressions: true,
      settingsMenu: false,
      language: "en",
    });
    return () => calc.destroy();
  }, [ready]);

  return (
    <>
      <Script
        src={`https://www.desmos.com/api/v1.10/calculator.js?apiKey=${DESMOS_API_KEY}`}
        strategy="afterInteractive"
        onReady={() => setReady(true)}
      />
      <div ref={ref} style={{ height }} className="w-full overflow-hidden rounded-xl border border-brand-100 bg-white">
        {!ready && <div className="p-4 text-sm text-ink/50">Тооны машин ачаалж байна…</div>}
      </div>
    </>
  );
}
