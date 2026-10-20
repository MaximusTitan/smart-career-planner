"use client";

import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui";
import { Loading } from "@/components/Loading";
import { useStore } from "@/lib/store";

export default function SavedPlans() {
  const router = useRouter();
  const { ready, careers, savedIds, select, toggleSaved } = useStore();

  if (!ready) return <Loading />;

  const saved = careers.filter((c) => savedIds.includes(c.id));

  if (saved.length === 0) {
    return (
      <div className="grid place-items-center gap-4 py-16 text-center">
        <h1 className="text-3xl font-black text-violet-900">No saved plans yet ⚡</h1>
        <p className="text-xl font-semibold">Open a job and press “Save” to keep it here.</p>
        <ButtonLink href="/jobs">See my jobs</ButtonLink>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-3xl font-black text-violet-900">⚡ My saved plans</h1>
      <ul className="space-y-3">
        {saved.map((c) => (
          <li
            key={c.id}
            className="flex flex-wrap items-center gap-4 rounded-3xl border-2 border-violet-100 bg-white p-4 shadow-sm"
          >
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-violet-100 text-4xl" aria-hidden>
              {c.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-black">{c.title}</h2>
              <p className="text-lg font-semibold">{c.tagline}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  select(c.id);
                  router.push("/plan");
                }}
              >
                Open plan
              </Button>
              <Button variant="ghost" onClick={() => toggleSaved(c.id)}>
                Remove
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
