"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ollie } from "@/components/Ollie";
import { Button, ButtonLink } from "@/components/ui";
import { Loading } from "@/components/Loading";
import { OTHER_LABEL, QUIZ, quizAnswerText } from "@/lib/options";
import { useStore } from "@/lib/store";

export default function Quiz() {
  const { ready } = useStore();
  return ready ? <QuizSteps /> : <Loading />;
}

function QuizSteps() {
  const router = useRouter();
  const { profile, updateProfile, findJobs, loading, error } = useStore();
  // Always start at question 1 so saved answers are visible and can be changed.
  const [step, setStep] = useState(0);

  const q = QUIZ[step];
  const isLast = step === QUIZ.length - 1;
  const picked = profile.quiz[step];
  const isOther = picked === OTHER_LABEL;
  // "Other" needs some words before moving on.
  const answered = Boolean(picked) && (!isOther || quizAnswerText(profile, step).length > 0);

  async function finish() {
    if (await findJobs()) router.push("/jobs");
  }

  if (loading) {
    return (
      <div className="grid place-items-center gap-4 py-20 text-center" role="status">
        <Ollie size={140} className="animate-bounce" />
        <p className="text-3xl font-black text-violet-900">Ollie is thinking…</p>
        <p className="text-xl font-semibold">Finding jobs you&apos;d love!</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xl font-black text-violet-800">
          Question {step + 1} of {QUIZ.length}
        </p>
        <ButtonLink href="/" variant="ghost" className="!py-1 text-base">
          Stop for now
        </ButtonLink>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-violet-100" aria-hidden>
        <div
          className="h-full rounded-full bg-orange-400 transition-all"
          style={{
            width: `${((step + (picked ? 1 : 0)) / QUIZ.length) * 100}%`,
          }}
        />
      </div>

      <div className="flex items-center gap-4">
        <Ollie size={72} />
        <h1 className="text-3xl font-black text-violet-950">{q.question}</h1>
      </div>
      <p className="text-lg font-bold text-slate-600">
        {picked ? "Your earlier pick is highlighted. Tap another to change it." : "Tap your favourite!"}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {q.options.map((o) => {
          const on = picked === o.label;
          return (
            <button
              key={o.label}
              aria-pressed={on}
              onClick={() => updateProfile({ quiz: { ...profile.quiz, [step]: o.label } })}
              className={`flex min-h-32 flex-col items-center justify-center gap-2 rounded-3xl border-4 p-4 text-xl font-extrabold transition active:scale-95 focus-visible:outline-4 focus-visible:outline-sky-400 ${
                on
                  ? "border-violet-600 bg-violet-600 text-white shadow-lg"
                  : "border-violet-200 bg-white hover:border-violet-400"
              }`}
            >
              <span className="text-5xl" aria-hidden>
                {o.emoji}
              </span>
              {o.label}
            </button>
          );
        })}
        {q.allowOther && (
          <button
            aria-pressed={isOther}
            onClick={() => updateProfile({ quiz: { ...profile.quiz, [step]: OTHER_LABEL } })}
            className={`flex min-h-20 items-center justify-center gap-3 rounded-3xl border-4 p-4 text-xl font-extrabold transition active:scale-95 focus-visible:outline-4 focus-visible:outline-sky-400 sm:col-span-2 ${
              isOther
                ? "border-violet-600 bg-violet-600 text-white shadow-lg"
                : "border-violet-200 bg-white hover:border-violet-400"
            }`}
          >
            <span className="text-4xl" aria-hidden>
              ✍️
            </span>
            Something else
          </button>
        )}
      </div>

      {q.allowOther && isOther && (
        <label className="block space-y-2">
          <span className="text-lg font-extrabold text-violet-900">{q.allowOther.prompt}</span>
          <input
            value={profile.quizOther?.[step] ?? ""}
            onChange={(e) =>
              updateProfile({
                quizOther: {
                  ...profile.quizOther,
                  [step]: e.target.value.slice(0, 40),
                },
              })
            }
            placeholder={q.allowOther.placeholder}
            autoComplete="off"
            autoFocus
            className="w-full rounded-2xl border-2 border-violet-200 px-4 py-3 text-xl focus:border-violet-500 focus:outline-none"
          />
        </label>
      )}

      {isLast && (
        <label className="block space-y-2">
          <span className="text-lg font-extrabold text-violet-900">Anything else you love? (optional)</span>
          <input
            value={profile.extra}
            onChange={(e) => updateProfile({ extra: e.target.value.slice(0, 200) })}
            placeholder="Like dinosaurs, guitars, space…"
            className="w-full rounded-2xl border-2 border-violet-200 px-4 py-3 text-xl focus:border-violet-500 focus:outline-none"
          />
        </label>
      )}

      {error && (
        <p role="alert" className="rounded-2xl bg-red-100 p-3 text-lg font-bold text-red-800">
          {error}
        </p>
      )}

      <div className="flex justify-between gap-3">
        <Button variant="secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>
          ← Back
        </Button>
        {isLast ? (
          <Button variant="success" disabled={!answered} onClick={finish}>
            See my jobs ✨
          </Button>
        ) : (
          <Button disabled={!answered} onClick={() => setStep(step + 1)}>
            Next →
          </Button>
        )}
      </div>
    </div>
  );
}
