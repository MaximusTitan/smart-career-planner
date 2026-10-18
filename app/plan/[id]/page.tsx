import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Card, ButtonLink } from "@/components/ui";
import { getSupabase } from "@/lib/supabase";

export const metadata = { title: "A Smart Career Planner plan", robots: { index: false } };

type Plan = {
  name: string;
  grade: number | null;
  careerTitle: string;
  careerEmoji: string;
  loves: string[];
  missions: string[];
};

export default function SharedPlanPage({ params }: PageProps<"/plan/[id]">) {
  return (
    <Suspense fallback={<p className="py-20 text-center text-5xl">🦉</p>}>
      <SharedPlan params={params} />
    </Suspense>
  );
}

async function SharedPlan({ params }: { params: PageProps<"/plan/[id]">["params"] }) {
  const { id } = await params;
  const supabase = getSupabase();
  if (!supabase || !/^[\w-]{6,40}$/.test(id)) notFound();

  const { data } = await supabase.rpc("get_shared_plan", { p_id: id });
  if (!data) notFound();
  const plan = data as Plan;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <p className="rounded-2xl bg-sky-100 p-3 text-center text-lg font-bold text-sky-900">
        👋 You&apos;re looking at a plan {plan.name ? `${plan.name} ` : "a student "}shared with you. This page is read-only.
      </p>
      <Card className="space-y-4 border-4 border-orange-300">
        <p className="text-base font-semibold text-slate-600">
          {plan.name || "A student"}
          {plan.grade ? ` | Grade ${plan.grade}` : ""}
        </p>
        <h1 className="rounded-2xl bg-violet-100 p-4 text-3xl font-black text-violet-950">
          {plan.careerEmoji} Wants to be a {plan.careerTitle}!
        </h1>
        {plan.loves.length > 0 && (
          <p className="text-xl font-bold">
            Loves: <span className="font-semibold">{plan.loves.join(" · ")}</span>
          </p>
        )}
        <div>
          <h2 className="mb-2 text-2xl font-black text-violet-900">3 missions</h2>
          <ul className="list-inside list-disc space-y-1 text-xl font-semibold">
            {plan.missions.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
        <p className="text-lg font-semibold text-slate-600">
          Tip: ask them what they love most about this job. It is a great conversation starter!
        </p>
      </Card>
      <div className="text-center">
        <ButtonLink href="/">Try Smart Career Planner yourself</ButtonLink>
      </div>
    </div>
  );
}
