"use client";

import { useRouter } from "next/navigation";
import { NeedJobs } from "@/components/NeedJobs";
import { Button, ButtonLink, Card, Icons } from "@/components/ui";
import { Loading } from "@/components/Loading";
import { useStore } from "@/lib/store";

export default function Compare() {
  const router = useRouter();
  const { ready, careers, compareIds, select } = useStore();

  if (!ready) return <Loading />;
  if (careers.length === 0) return <NeedJobs />;

  const chosen = careers.filter((c) => compareIds.includes(c.id));
  const pair = chosen.length === 2 ? chosen : careers.slice(0, 2);

  function choose(id: string) {
    select(id);
    router.push("/map");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-violet-950">Compare jobs ⚖️</h1>
          <p className="text-lg font-semibold text-slate-600">
            {chosen.length === 2
              ? "Which one feels more like you?"
              : "Showing your top two. Go back and tap + Compare to pick others."}
          </p>
        </div>
        <ButtonLink href="/jobs" variant="ghost">
          ← Back
        </ButtonLink>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {pair.map((c) => (
          <Card key={c.id} className="space-y-4">
            <div className="text-center">
              <div className="text-6xl" aria-hidden>
                {c.emoji}
              </div>
              <h2 className="text-3xl font-black text-violet-900">{c.title}</h2>
            </div>
            <Row label="What you do">{c.tagline}</Row>
            <Row label="You'll like it if you love">{c.skills.join(", ")}</Row>
            <Row label="Study now">{c.studyNow.join(", ")}</Row>
            <Row label="Pay">
              <Icons count={c.pay} icon="💰" />
            </Row>
            <Row label="Will we need it?">
              <Icons count={c.demand} icon="📈" />
            </Row>
            <Button variant="success" className="w-full" onClick={() => choose(c.id)}>
              Choose {c.title}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-base font-extrabold tracking-wide text-violet-700 uppercase">{label}</p>
      <div className="text-xl font-semibold">{children}</div>
    </div>
  );
}
