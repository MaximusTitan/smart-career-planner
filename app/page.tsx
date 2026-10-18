"use client";

import { useRouter } from "next/navigation";
import { Ollie } from "@/components/Ollie";
import { Button, Card, Chip, ChipGroup } from "@/components/ui";
import { GOOD_AT, GRADES, LOVES, SUBJECTS } from "@/lib/options";
import type { Option } from "@/lib/options";
import { Loading } from "@/components/Loading";
import { useStore } from "@/lib/store";

export default function AboutMe() {
  const router = useRouter();
  const { ready, profile, updateProfile } = useStore();

  const toggle = (list: string[], label: string) =>
    list.includes(label) ? list.filter((l) => l !== label) : [...list, label];

  const picks = (key: "subjects" | "loves" | "goodAt", options: Option[]) =>
    options.map((o) => (
      <Chip
        key={o.label}
        emoji={o.emoji}
        selected={profile[key].includes(o.label)}
        onClick={() => updateProfile({ [key]: toggle(profile[key], o.label) })}
      >
        {o.label}
      </Chip>
    ));

  const canStart = profile.grade !== null && profile.subjects.length + profile.loves.length > 0;

  if (!ready) return <Loading />;

  return (
    <div className="grid gap-6 md:grid-cols-[18rem_1fr]">
      <aside className="flex flex-col items-center gap-4 text-center">
        <Ollie size={160} />
        <h1 className="text-3xl font-black text-violet-900">Hi! I&apos;m Ollie the owl</h1>
        <p className="text-xl font-semibold">Tell me about you and I&apos;ll find jobs you&apos;d love!</p>
      </aside>

      <Card className="space-y-6">
        <label className="block space-y-2">
          <span className="text-xl font-extrabold text-violet-900">What should I call you?</span>
          <input
            value={profile.name}
            onChange={(e) => updateProfile({ name: e.target.value.slice(0, 20) })}
            placeholder="First name or a nickname"
            autoComplete="off"
            className="w-full rounded-2xl border-2 border-violet-200 px-4 py-3 text-xl focus:border-violet-500 focus:outline-none"
          />
        </label>

        <ChipGroup title="I'm in grade">
          {GRADES.map((g) => (
            <Chip key={g} selected={profile.grade === g} onClick={() => updateProfile({ grade: g })}>
              Grade {g}
            </Chip>
          ))}
        </ChipGroup>
        <ChipGroup title="I love at school">{picks("subjects", SUBJECTS)}</ChipGroup>
        <ChipGroup title="I love to">{picks("loves", LOVES)}</ChipGroup>
        <ChipGroup title="I'm good at">{picks("goodAt", GOOD_AT)}</ChipGroup>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-base font-semibold text-slate-600">
            {canStart ? "Great! Ready for the quiz?" : "Pick your grade and at least one thing you love."}
          </p>
          <Button disabled={!canStart} onClick={() => router.push("/quiz")}>
            Let&apos;s go! 🚀
          </Button>
        </div>
      </Card>
    </div>
  );
}
