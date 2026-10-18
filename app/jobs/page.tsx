"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NeedJobs } from "@/components/NeedJobs";
import { Button, ButtonLink, FIT_LABEL, FIT_STYLE } from "@/components/ui";
import { Loading } from "@/components/Loading";
import { useStore } from "@/lib/store";

export default function Jobs() {
  const router = useRouter();
  const { ready, careers, profile, select, compareIds, toggleCompare, savedIds } = useStore();
  const [showAll, setShowAll] = useState(false);

  if (!ready) return <Loading />;
  if (careers.length === 0) return <NeedJobs />;

  const shown = showAll ? careers : careers.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-violet-950">
            Jobs that fit you{profile.name ? `, ${profile.name}` : ""}! 🎉
          </h1>
          <p className="text-lg font-semibold text-slate-600">
            These are ideas to explore, not rules. Tap one to learn more.
          </p>
        </div>
        <ButtonLink href="/compare" variant="secondary" aria-disabled={compareIds.length < 2}>
          ⚖️ Compare jobs {compareIds.length > 0 && `(${compareIds.length}/2)`}
        </ButtonLink>
      </div>

      <ul className="space-y-3">
        {shown.map((c) => {
          const comparing = compareIds.includes(c.id);
          return (
            <li
              key={c.id}
              className="flex flex-wrap items-center gap-4 rounded-3xl border-2 border-violet-100 bg-white p-4 shadow-sm"
            >
              <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-violet-100 text-4xl" aria-hidden>
                {c.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-black">{c.title}</h2>
                  <span className={`rounded-full px-3 py-0.5 text-sm font-extrabold ${FIT_STYLE[c.fit]}`}>
                    {FIT_LABEL[c.fit]}
                  </span>
                  {savedIds.includes(c.id) && <span aria-label="Saved">⚡</span>}
                </div>
                <p className="text-lg font-semibold">{c.tagline}</p>
                <p className="text-base text-slate-600">{c.whyFit}</p>
              </div>
              <div className="flex gap-2">
                <button
                  aria-pressed={comparing}
                  onClick={() => toggleCompare(c.id)}
                  className={`rounded-full border-2 px-4 py-2 font-extrabold ${
                    comparing ? "border-emerald-600 bg-emerald-100 text-emerald-800" : "border-violet-200 text-violet-700"
                  }`}
                >
                  {comparing ? "✓ Comparing" : "+ Compare"}
                </button>
                <Button
                  onClick={() => {
                    select(c.id);
                    router.push("/detail");
                  }}
                >
                  See more →
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      {!showAll && careers.length > 5 && (
        <div className="text-center">
          <Button variant="secondary" onClick={() => setShowAll(true)}>
            Show {careers.length - 5} more ideas ✨
          </Button>
        </div>
      )}
    </div>
  );
}
