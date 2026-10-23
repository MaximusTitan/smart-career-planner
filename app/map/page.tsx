"use client";

import { useRouter } from "next/navigation";
import { NeedJobs } from "@/components/NeedJobs";
import { Button, ButtonLink, Card } from "@/components/ui";
import { Loading } from "@/components/Loading";
import { useStore } from "@/lib/store";

export default function AdventureMap() {
  const router = useRouter();
  const { ready, selected, profile } = useStore();

  if (!ready) return <Loading />;
  if (!selected) return <NeedJobs />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-violet-950">Your adventure map 🗺️</h1>
          <p className="text-lg font-semibold text-slate-600">
            Your path to becoming a {selected.title} {selected.emoji}
          </p>
        </div>
        <ButtonLink href="/detail" variant="ghost">
          ← Back to {selected.title}
        </ButtonLink>
      </div>

      <ol className="grid gap-4 md:grid-cols-4">
        {selected.roadmap.map((stage, i) => {
          const current =
            profile.grade !== null &&
            stage.grade === (profile.grade >= 7 ? "Grade 7+" : `Grade ${Math.max(profile.grade, 4)}`);
          return (
            <li key={stage.grade} className="relative">
              <Card className={`h-full space-y-3 ${current ? "border-orange-400 ring-4 ring-orange-200" : ""}`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-violet-900">{stage.grade}</h2>
                  {current && (
                    <span className="rounded-full bg-orange-500 px-2 py-0.5 text-sm font-extrabold text-white">
                      You are here
                    </span>
                  )}
                </div>
                <p className="text-lg font-bold">📚 {stage.subjects}</p>
                <p className="rounded-xl bg-sky-50 p-2 text-lg font-semibold">🧪 {stage.tryIt}</p>
                <p className="rounded-xl bg-amber-50 p-2 text-lg font-extrabold text-amber-900">
                  ⭐ {i === selected.roadmap.length - 1 ? "Next goal" : "Mission"}: {stage.mission}
                </p>
              </Card>
            </li>
          );
        })}
      </ol>

      <div className="flex justify-center gap-3">
        <Button variant="secondary" onClick={() => router.push("/jobs")}>
          Explore more jobs
        </Button>
        <Button variant="success" onClick={() => router.push("/plan")}>
          Save my plan 🚀
        </Button>
      </div>
    </div>
  );
}
