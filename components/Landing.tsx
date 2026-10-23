import Link from "next/link";
import { Ollie } from "@/components/Ollie";
import { ButtonLink } from "@/components/ui";

const SAMPLE_JOBS = [
  { emoji: "🎮", title: "Game Maker", fit: "Great fit", why: "You love games and making things, so you might like designing your own games." },
  { emoji: "📱", title: "App Developer", fit: "Great fit", why: "You love computers and new ideas, so you might enjoy building apps that others can use." },
  { emoji: "🤖", title: "Robot Engineer", fit: "Great fit", why: "You love building things and science, so you might like creating robots from your own ideas." },
];

const STEPS = [
  { emoji: "🦉", title: "Tell Ollie about you", text: "Pick your grade and the things you love at school and in your free time." },
  { emoji: "🧩", title: "Play a quick quiz", text: "Five picture-led questions, like choosing your favourite superpower." },
  { emoji: "✨", title: "Meet your matches", text: "AI suggests jobs you might love and tells you why each one fits." },
  { emoji: "🗺️", title: "Follow your map", text: "Get small missions for every grade so your dream feels reachable." },
];

const FEATURES = [
  { emoji: "💬", title: "Ask Ollie anything", text: "A friendly chat buddy answers questions about jobs, school and skills." },
  { emoji: "⚖️", title: "Compare two jobs", text: "See pay, demand and what to study side by side, then choose." },
  { emoji: "📅", title: "A day in the life", text: "Find out what people in each job actually do, in plain words." },
  { emoji: "🖨️", title: "Share your plan", text: "Print it or send a link so your family can cheer you on." },
  { emoji: "⚡", title: "Save your favourites", text: "Keep the jobs you like in one place and come back any time." },
  { emoji: "🎓", title: "Made for Grades 1 to 12", text: "Simple words and ideas that grow with you." },
];

export function Landing() {
  return (
    <div className="space-y-16 pb-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-100 via-white to-brand-yellow/30 px-6 py-10 sm:px-12 sm:py-14">
        <span aria-hidden className="absolute -top-6 right-10 text-6xl opacity-80 animate-float">⭐</span>
        <span aria-hidden className="absolute bottom-8 left-6 text-5xl opacity-70 animate-float [animation-delay:-2s]">🚀</span>
        <span aria-hidden className="absolute bottom-6 right-1/3 text-4xl opacity-70 animate-float [animation-delay:-4s]">🎨</span>
        <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div className="space-y-5">
            <p className="inline-block rounded-full bg-white px-4 py-1 text-base font-extrabold text-violet-700 shadow-sm">
              For students in Grades 1 to 12
            </p>
            <h1 className="text-5xl font-black leading-tight text-violet-950 sm:text-6xl">
              Find what you <span className="text-violet-600">could become</span>
            </h1>
            <p className="max-w-xl text-xl font-semibold text-slate-700">
              Answer a few fun questions and Ollie the owl will match you with jobs you might love, then show you the
              first steps to get there.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <ButtonLink href="/signup" className="px-8 py-4 text-xl">
                Start exploring 🚀
              </ButtonLink>
              <ButtonLink href="/login" variant="secondary" className="px-8 py-4 text-xl">
                I have an account
              </ButtonLink>
            </div>
          </div>
          <div className="flex justify-center">
            <Ollie size={240} className="animate-float drop-shadow-xl" />
          </div>
        </div>
      </section>

      {/* Sample matches */}
      <section className="space-y-5">
        <div className="text-center">
          <h2 className="text-3xl font-black text-violet-950">Jobs that fit you 🎉</h2>
          <p className="text-lg font-semibold text-slate-600">A taste of what Ollie finds. Yours will be all about you.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {SAMPLE_JOBS.map((j) => (
            <div key={j.title} className="space-y-3 rounded-3xl border-2 border-violet-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span aria-hidden className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-3xl">
                  {j.emoji}
                </span>
                <div>
                  <h3 className="text-xl font-black text-violet-900">{j.title}</h3>
                  <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-sm font-extrabold text-emerald-800">
                    {j.fit}
                  </span>
                </div>
              </div>
              <p className="text-base font-semibold text-slate-600">{j.why}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="space-y-5">
        <h2 className="text-center text-3xl font-black text-violet-950">How it works</h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative space-y-2 rounded-3xl bg-white p-5 pt-8 shadow-sm ring-2 ring-violet-100">
              <span className="absolute -top-4 left-5 flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-lg font-black text-white">
                {i + 1}
              </span>
              <div aria-hidden className="text-4xl">
                {s.emoji}
              </div>
              <h3 className="text-xl font-black text-violet-900">{s.title}</h3>
              <p className="text-base font-semibold text-slate-600">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Features */}
      <section className="space-y-5">
        <h2 className="text-center text-3xl font-black text-violet-950">Everything you need to explore</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex gap-4 rounded-3xl bg-violet-50 p-5">
              <span aria-hidden className="text-4xl">
                {f.emoji}
              </span>
              <div>
                <h3 className="text-lg font-black text-violet-900">{f.title}</h3>
                <p className="text-base font-semibold text-slate-600">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final call to action */}
      <section className="rounded-[2.5rem] bg-violet-600 px-6 py-10 text-center text-white sm:px-12">
        <h2 className="text-3xl font-black sm:text-4xl">Ready to meet your future self?</h2>
        <p className="mt-2 text-xl font-semibold text-violet-100">Create an account and start in a minute.</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/signup" className="px-8 py-4 text-xl">
            Sign up and start
          </ButtonLink>
          <Link href="/login" className="rounded-full px-6 py-3 text-lg font-extrabold underline hover:bg-white/10">
            Sign in
          </Link>
        </div>
      </section>
    </div>
  );
}
