"use client";

import { useState } from "react";
import type { ReactNode } from "react";import { useRouter } from "next/navigation";
import { Ollie } from "@/components/Ollie";
import { Button, Card, Chip, ChipGroup } from "@/components/ui";
import { GOOD_AT, GRADES, LOVES, SUBJECTS } from "@/lib/options";
import type { Option } from "@/lib/options";
import { Loading } from "@/components/Loading";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { Landing } from "@/components/Landing";

/** Signed-out visitors see the landing page; signed-in students start with the profile step. */
export default function Home() {
  const { status } = useAuth();
  return status === "anon" ? <Landing /> : <AboutMe />;
}

function AboutMe() {
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

  const canStart = profile.grade !== null && 
    profile.subjects.length + profile.loves.length + (profile.otherSubject?.trim() ? 1 : 0) + (profile.otherLove?.trim() ? 1 : 0) > 0;

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

        <label className="block space-y-2">
          <span className="block text-xl font-extrabold text-violet-900">I&apos;m in grade</span>
          <select
            value={profile.grade ?? ""}
            onChange={(e) => updateProfile({ grade: e.target.value ? Number(e.target.value) : null })}
            className="w-full rounded-2xl border-2 border-violet-200 bg-white px-4 py-3 text-xl font-bold focus:border-violet-500 focus:outline-none sm:w-64"
          >
            <option value="">Pick your grade</option>
            {GRADES.map((g) => (
              <option key={g} value={g}>
                Grade {g}
              </option>
            ))}
          </select>
        </label>
        <ChipsWithOther
          title="I love at school"
          question="What else do you love at school?"
          placeholder="Like Drama, Cooking, Languages…"
          value={profile.otherSubject ?? ""}
          onChange={(v) => updateProfile({ otherSubject: v })}
        >
          {picks("subjects", SUBJECTS)}
        </ChipsWithOther>
        <ChipsWithOther
          title="I love to"
          question="What else do you love to do?"
          placeholder="Like Cook, Dance, Skateboard…"
          value={profile.otherLove ?? ""}
          onChange={(v) => updateProfile({ otherLove: v })}
        >
          {picks("loves", LOVES)}
        </ChipsWithOther>
        <ChipsWithOther
          title="I'm good at"
          question="What else are you good at?"
          placeholder="Like Drawing, Cooking, Helping friends…"
          value={profile.otherGoodAt ?? ""}
          onChange={(v) => updateProfile({ otherGoodAt: v })}
        >
          {picks("goodAt", GOOD_AT)}
        </ChipsWithOther>

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

/** A group of chips plus an "Other" chip that opens a box for the student's own words. */
function ChipsWithOther({
  title,
  question,
  placeholder,
  value,
  onChange,
  children,
}: {
  title: string;
  question: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const on = open || Boolean(value.trim());

  return (
    <div className="space-y-4">
      <ChipGroup title={title}>
        {children}
        <Chip
          emoji="✍️"
          selected={on}
          onClick={() => {
            if (on) onChange("");
            setOpen(!on);
          }}
        >
          Other
        </Chip>
      </ChipGroup>
      {on && (
        <label className="block space-y-2">
          <span className="text-lg font-extrabold text-violet-900">{question}</span>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value.slice(0, 40))}
            placeholder={placeholder}
            autoComplete="off"
            autoFocus
            className="w-full rounded-2xl border-2 border-violet-200 px-4 py-3 text-xl focus:border-violet-500 focus:outline-none"
          />
        </label>
      )}
    </div>
  );
}
