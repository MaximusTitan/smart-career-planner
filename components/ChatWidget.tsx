"use client";

import { useEffect, useRef, useState } from "react";
import { Ollie } from "./Ollie";
import { useStore } from "@/lib/store";
import type { ChatMessage } from "@/lib/types";

const STARTERS = [
  "I don't know what I like 🤔",
  "What does a vet do all day?",
  "What should I study?",
];

export function ChatWidget() {
  const { profile, careers } = useStore();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send(text: string) {
    const content = text.trim().slice(0, 500);
    if (!content || busy) return;
    const next: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next,
          profile,
          careers: careers.map((c) => c.title),
        }),
      });
      if (!res.ok || !res.body) throw new Error("bad response");
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let reply = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        reply += value;
        setMessages([...next, { role: "assistant", content: reply }]);
      }
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: "Hoo! I got a bit dizzy. Can you ask me again? 🦉" },
      ]);
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-4 z-20 flex items-center gap-2 rounded-full bg-violet-600 py-2 pr-5 pl-2 text-lg font-extrabold text-white shadow-xl transition hover:bg-violet-500 active:scale-95 focus-visible:outline-4 focus-visible:outline-sky-400"
      >
        <span className="rounded-full bg-white p-1">
          <Ollie size={40} />
        </span>
        Ask Ollie
      </button>
    );
  }

  return (
    <section
      aria-label="Chat with Ollie"
      className="fixed right-3 bottom-3 z-20 flex h-[min(34rem,calc(100vh-1.5rem))] w-[min(24rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-3xl border-2 border-violet-200 bg-white shadow-2xl"
    >
      <div className="flex items-center justify-between bg-violet-600 px-4 py-2 text-white">
        <div className="flex items-center gap-2 text-lg font-extrabold">
          <span className="rounded-full bg-white p-1">
            <Ollie size={32} />
          </span>
          Ollie the Career Helper
        </div>
        <button
          onClick={() => setOpen(false)}
          aria-label="Close chat"
          className="rounded-full px-3 py-1 text-xl font-black hover:bg-violet-500 focus-visible:outline-4 focus-visible:outline-sky-300"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        <Bubble role="assistant">
          Hoo-hoo! I&apos;m Ollie. Ask me anything about jobs. Not sure what you like? Tell me, and I&apos;ll help you
          think! 🦉
        </Bubble>
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role}>
            {m.content || "…"}
          </Bubble>
        ))}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {STARTERS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border-2 border-violet-200 px-3 py-1 text-left font-bold text-violet-700 hover:bg-violet-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div ref={bottom} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 border-t-2 border-violet-100 p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={500}
          placeholder="Type your question…"
          aria-label="Your question"
          className="min-w-0 flex-1 rounded-full border-2 border-violet-200 px-4 py-2 text-lg focus:border-violet-500 focus:outline-none"
        />
        <button
          disabled={busy || !input.trim()}
          className="rounded-full bg-orange-500 px-5 text-lg font-extrabold text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </section>
  );
}

function Bubble({ role, children }: { role: ChatMessage["role"]; children: React.ReactNode }) {
  const mine = role === "user";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <p
        className={`max-w-[85%] rounded-2xl px-4 py-2 text-lg whitespace-pre-wrap ${
          mine ? "bg-orange-100 text-slate-900" : "bg-violet-100 text-violet-950"
        }`}
      >
        {children}
      </p>
    </div>
  );
}
