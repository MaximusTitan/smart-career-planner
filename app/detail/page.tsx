"use client";

import { useRouter } from "next/navigation";
import { NeedJobs } from "@/components/NeedJobs";
import { Button, ButtonLink, Card, FIT_LABEL, FIT_STYLE, Icons } from "@/components/ui";
import { Loading } from "@/components/Loading";
import { useStore } from "@/lib/store";

export default function Detail() {
  const router = useRouter();
  const { ready, careers, selected, select, savedIds, toggleSaved } = useStore();

  if (!ready) return <Loading />;
  if (!selected) return <NeedJobs />;

  const index = careers.findIndex((c) => c.id === selected.id);
  const saved = savedIds.includes(selected.id);
  const go = (offset: number) => select(careers[(index + offset + careers.length) % careers.length].id);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ButtonLink href="/jobs" variant="ghost">
          ← Back
        </ButtonLink>
        <div className="flex items-center gap-2 text-lg font-bold text-slate-600">
          <Button variant="secondary" className="!px-4 !py-1" onClick={() => go(-1)} aria-label="Previous job">
            ←
          </Button>
          Job {index + 1} of {careers.length}
          <Button variant="secondary" className="!px-4 !py-1" onClick={() => go(1)} aria-label="Next job">
            →
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-3xl bg-violet-600 p-5 text-white">
        <span className="text-6xl" aria-hidden>
          {selected.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-4xl font-black">{selected.title}</h1>
          <p className="text-xl font-semibold">{selected.tagline}</p>
          <span className={`mt-1 inline-block rounded-full px-3 py-0.5 text-sm font-extrabold ${FIT_STYLE[selected.fit]}`}>
            {FIT_LABEL[selected.fit]}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => toggleSaved(selected.id)} aria-pressed={saved}>
            {saved ? "⚡ Saved" : "⚡ Save"}
          </Button>
          <Button onClick={() => router.push("/map")}>My map →</Button>
        </div>
      </div>

      <p className="rounded-2xl bg-amber-100 p-4 text-xl font-bold text-amber-950">💛 {selected.whyFit}</p>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-2 text-2xl font-black text-violet-900">A day in the life</h2>
          <ul className="space-y-2 text-xl font-semibold">
            {selected.day.map((d, i) => (
              <li key={d}>
                {["💡", "✏️", "🎯"][i % 3]} {d}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="mb-2 text-2xl font-black text-violet-900">Skills to grow</h2>
          <div className="flex flex-wrap gap-2">
            {selected.skills.map((s) => (
              <span key={s} className="rounded-full bg-sky-100 px-4 py-1 text-xl font-bold text-sky-900">
                {s}
              </span>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="mb-2 text-2xl font-black text-violet-900">What to study</h2>
          <p className="text-lg font-extrabold">Now, at school:</p>
          <p className="mb-2 text-xl font-semibold">{selected.studyNow.join(" · ")}</p>
          <p className="text-lg font-extrabold">When you&apos;re older:</p>
          <p className="text-xl font-semibold">{selected.studyLater.join(" · ")}</p>
        </Card>
        <Card className="space-y-3">
          <div>
            <h2 className="text-2xl font-black text-violet-900">Does it pay well?</h2>
            <Icons count={selected.pay} icon="💰" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-violet-900">Will we need it?</h2>
            <Icons count={selected.demand} icon="📈" />
          </div>
        </Card>
      </div>
    </div>
  );
}
