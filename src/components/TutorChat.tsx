"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types";
import { CatIcon } from "./Logo";
import { MathMarkdown } from "./MathMarkdown";

const QUICK_BEFORE = ["Сэжүүр өгөөч 🐾", "Эхний алхам юу вэ?", "Энэ асуулт юу асууж байна вэ?"];
const QUICK_GENERAL = [
  "Digital SAT математик ямар бүтэцтэй вэ?",
  "Квадрат тэгшитгэлийг хэрхэн бодох вэ?",
  "Desmos-ийг шалгалтад яаж ашиглах вэ?",
  "Хувийн бодлогын заль мэх",
];
const QUICK_AFTER = ["Яагаад миний хариулт буруу вэ?", "Алхам алхмаар тайлбарла", "Ижил төстэй бодлого өгөөч"];

export function TutorChat({
  questionId,
  answered = false,
  selected,
  wasCorrect,
  height = "h-[560px]",
}: {
  questionId?: string;
  answered?: boolean;
  height?: string;
  selected?: string;
  wasCorrect?: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
    setError(null);
  }, [questionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    setError(null);
    setInput("");
    const history: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setLoading(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, messages: history, selected, wasCorrect }),
      });
      if (!res.ok || !res.body) {
        const j = (await res.json().catch(() => null)) as unknown as { error?: string } | null;
        throw new Error(j?.error ?? "AI багштай холбогдож чадсангүй.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: acc }]);
      }
      if (!acc.trim()) throw new Error("AI хариу ирсэнгүй. Дахин оролдоно уу.");
    } catch (e) {
      setMessages(history);
      setError(e instanceof Error ? e.message : "Алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  }

  const quick = !questionId ? QUICK_GENERAL : answered ? QUICK_AFTER : QUICK_BEFORE;

  return (
    <div className={`flex ${height} flex-col`}>
      <div className="flex items-center gap-2 border-b border-brand-100 px-4 py-3">
        <CatIcon size={28} />
        <div>
          <div className="text-sm font-extrabold">AI багш Суу</div>
          <div className="text-[11px] text-ink/50">
            {!questionId
              ? "SAT математикийн юу ч асуу"
              : answered
                ? "Тайлбар, дүн шинжилгээ"
                : "Хариултаа шалгахаас өмнө зөвхөн сэжүүр өгнө"}
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="rounded-xl bg-brand-50 p-3 text-sm text-ink/70">
            {questionId
              ? "Сайн уу! Би Суу 🐈‍⬛. Энэ бодлого дээр гацвал асуугаарай — хамтдаа алхам алхмаар бодъё."
              : "Сайн уу! Би Суу 🐈‍⬛. SAT математикийн ойлголт, арга барил, эсвэл өөрийн бодлогоо асуугаарай."}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                m.role === "user"
                  ? "max-w-[85%] rounded-2xl rounded-br-md bg-brand-600 px-3.5 py-2 text-sm text-white"
                  : "max-w-[92%] rounded-2xl rounded-bl-md bg-brand-50 px-3.5 py-2 text-sm"
              }
            >
              {m.role === "assistant" ? (
                m.content ? (
                  <MathMarkdown>{m.content}</MathMarkdown>
                ) : (
                  <span className="animate-pulse text-ink/50">Суу бодож байна…</span>
                )
              ) : (
                m.content
              )}
            </div>
          </div>
        ))}
        {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-brand-100 p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {quick.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              disabled={loading}
              className="chip border-brand-200 bg-white text-ink/70 hover:bg-brand-50 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="input"
            placeholder="Асуултаа бичээрэй…"
            maxLength={1500}
          />
          <button className="btn-primary shrink-0" disabled={loading || !input.trim()}>
            Илгээх
          </button>
        </form>
      </div>
    </div>
  );
}
