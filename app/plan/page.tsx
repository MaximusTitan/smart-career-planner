"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NeedJobs } from "@/components/NeedJobs";
import { Button, Card } from "@/components/ui";
import { Loading } from "@/components/Loading";
import { useStore } from "@/lib/store";

export default function MyPlan() {
  const router = useRouter();
  const { ready, selected, profile, doneMissions, toggleMission } = useStore();
  const [shareNote, setShareNote] = useState<string | null>(null);

  if (!ready) return <Loading />;
  if (!selected) return <NeedJobs />;

  const missions = selected.roadmap.slice(0, 3).map((s) => s.mission);
  const loves = [...profile.subjects, ...profile.loves].slice(0, 4);

  async function share() {
    setShareNote("Making your link…");
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          grade: profile.grade,
          careerTitle: selected!.title,
          careerEmoji: selected!.emoji,
          loves,
          missions,
        }),
      });
      const { id } = (await res.json()) as { id: string | null };
      if (id) {
        const link = `${location.origin}/plan/${id}`;
        await navigator.clipboard?.writeText(link).catch(() => {});
        setShareNote(`Link copied! Send it to your family: ${link}`);
      } else {
        setShareNote("Sharing links aren't switched on yet. Use Print and show your family!");
      }
    } catch {
      setShareNote("Oops, could not make a link. Try Print instead!");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Card className="space-y-5 border-4 border-orange-300 bg-white">
        <div>
          <p className="text-lg font-bold text-violet-700">
            My Dream Job Plan 📝
          </p>
          <p className="text-base font-semibold text-slate-600">
            {profile.name ? `By ${profile.name}` : "By me"}
            {profile.grade ? ` | Grade ${profile.grade}` : ""}
          </p>
        </div>

        <h1 className="rounded-2xl bg-violet-100 p-4 text-3xl font-black text-violet-950">
          {selected.emoji} I want to be a {selected.title}!
        </h1>

        {loves.length > 0 && (
          <p className="text-xl font-bold">
            I love: <span className="font-semibold">{loves.join(" · ")}</span>
          </p>
        )}

        <div>
          <h2 className="mb-2 text-2xl font-black text-violet-900">My 3 missions</h2>
          <ul className="space-y-2">
            {missions.map((m) => {
              const done = doneMissions.includes(m);
              return (
                <li key={m}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-violet-100 p-3 text-xl font-bold">
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => toggleMission(m)}
                      className="size-7 accent-emerald-600"
                    />
                    <span className={done ? "line-through opacity-60" : ""}>{m}</span>
                    {done && <span aria-hidden>🌟</span>}
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      </Card>

      <div className="no-print flex flex-wrap justify-center gap-3">
        <Button onClick={share}>👨‍👩‍👧 Share with family</Button>
        <Button variant="secondary" onClick={() => window.print()}>
          🖨️ Print or save
        </Button>
        <Button variant="secondary" onClick={() => router.push("/map")}>
          Change my plan
        </Button>
        <Button variant="ghost" onClick={() => router.push("/jobs")}>
          Explore more jobs
        </Button>
      </div>
      {shareNote && (
        <p role="status" className="no-print break-all rounded-2xl bg-sky-100 p-3 text-center text-lg font-bold text-sky-900">
          {shareNote}
        </p>
      )}
    </div>
  );
}
