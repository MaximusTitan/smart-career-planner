"use client";

import { useState } from "react";
import { AccountsOff, FormError } from "@/components/AuthForm";
import { Ollie } from "@/components/Ollie";
import { Button, ButtonLink, Card, Chip } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { getBrowserSupabase } from "@/lib/supabase-browser";

const RATINGS = [
  { value: 1, emoji: "😞", label: "Not good" },
  { value: 2, emoji: "🙁", label: "Could be better" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "🤩", label: "Love it" },
];

const TOPICS = [
  { value: "jobs", emoji: "✨", label: "Job matches" },
  { value: "quiz", emoji: "🧩", label: "The quiz" },
  { value: "ollie", emoji: "🦉", label: "Ask Ollie" },
  { value: "look", emoji: "🎨", label: "How it looks" },
  { value: "bug", emoji: "🐞", label: "Something broke" },
  { value: "idea", emoji: "💡", label: "An idea" },
];

const MAX = 1000;

export default function Feedback() {
  const { available, user } = useAuth();
  const [rating, setRating] = useState<number | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase || !user || rating === null) return;
    setError(null);
    setBusy(true);
    const { error: saveError } = await supabase.from("feedback").insert({
      user_id: user.id,
      rating,
      topic,
      message: message.trim(),
    });
    setBusy(false);
    if (saveError) {
      console.error("feedback save failed", saveError.message);
      setError("Oh no, we couldn't save that. Please try again in a moment.");
      return;
    }
    setSent(true);
  }

  if (!available) return <AccountsOff />;

  if (sent) {
    return (
      <div className="mx-auto grid max-w-xl place-items-center gap-4 py-12 text-center">
        <Ollie size={140} className="animate-float" />
        <h1 className="text-3xl font-black text-violet-950">Thank you! 💛</h1>
        <p className="text-xl font-semibold text-slate-600">
          Ollie and the team read every note. Your ideas help make Smart Career Planner better for everyone.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink href="/jobs">Back to my jobs</ButtonLink>
          <Button
            variant="secondary"
            onClick={() => {
              setRating(null);
              setTopic(null);
              setMessage("");
              setSent(false);
            }}
          >
            Send more feedback
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-4">
        <Ollie size={80} />
        <div>
          <h1 className="text-3xl font-black text-violet-950">Tell us what you think</h1>
          <p className="text-lg font-semibold text-slate-600">Ollie is still learning. Your feedback helps!</p>
        </div>
      </div>

      <Card>
        <form onSubmit={submit} className="space-y-6">
          <fieldset className="space-y-2">
            <legend className="mb-2 text-xl font-extrabold text-violet-900">How is Smart Career Planner so far?</legend>
            <div className="grid grid-cols-5 gap-2">
              {RATINGS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  aria-pressed={rating === r.value}
                  onClick={() => setRating(r.value)}
                  className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-2 text-sm font-bold transition active:scale-95 focus-visible:outline-4 focus-visible:outline-sky-400 sm:text-base ${
                    rating === r.value
                      ? "border-violet-600 bg-violet-600 text-white shadow-md"
                      : "border-violet-200 bg-white text-slate-700 hover:border-violet-400"
                  }`}
                >
                  <span className="text-4xl" aria-hidden>
                    {r.emoji}
                  </span>
                  {r.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="mb-2 text-xl font-extrabold text-violet-900">What is it about? (optional)</legend>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <Chip
                  key={t.value}
                  emoji={t.emoji}
                  selected={topic === t.value}
                  onClick={() => setTopic(topic === t.value ? null : t.value)}
                >
                  {t.label}
                </Chip>
              ))}
            </div>
          </fieldset>

          <label className="block space-y-2">
            <span className="text-xl font-extrabold text-violet-900">Anything else you want to tell us? (optional)</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MAX))}
              rows={5}
              placeholder="What did you like? What was confusing? What would you add?"
              className="w-full rounded-2xl border-2 border-violet-200 px-4 py-3 text-lg focus:border-violet-500 focus:outline-none"
            />
            <span className="block text-right text-sm font-semibold text-slate-500">
              {message.length}/{MAX}
            </span>
          </label>

          <p className="text-base font-semibold text-slate-600">
            Please don&apos;t include your full name, school, address or phone number.
          </p>

          {error && <FormError>{error}</FormError>}

          <Button type="submit" disabled={busy || rating === null} className="w-full">
            {busy ? "Sending…" : "Send feedback 💌"}
          </Button>
          {rating === null && (
            <p className="text-center text-base font-semibold text-slate-500">Pick a face above to send.</p>
          )}
        </form>
      </Card>
    </div>
  );
}
