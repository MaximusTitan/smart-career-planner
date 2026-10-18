"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Ollie } from "./Ollie";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";

const STEPS = [
  { href: "/", label: "About me" },
  { href: "/quiz", label: "Quiz" },
  { href: "/jobs", label: "Jobs" },
  { href: "/detail", label: "Detail" },
  { href: "/map", label: "Map" },
  { href: "/compare", label: "Compare" },
  { href: "/plan", label: "My plan" },
];

const linkStyle = "rounded-full px-3 py-1 font-bold text-violet-700 hover:bg-violet-100";

export function Header() {
  return (
    <header className="border-b-2 border-violet-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-2xl font-black text-violet-800">
          <Ollie size={40} />
          Dream Jobs
        </Link>
        {/* usePathname needs the URL, so it streams in behind Suspense */}
        <Suspense fallback={<div className="h-8 w-80" aria-hidden />}>
          <StepNav />
        </Suspense>
        <AccountMenu />
      </div>
      <PlayingBanner />
    </header>
  );
}

function StepNav() {
  const pathname = usePathname();
  const current = STEPS.findIndex((s) => s.href === pathname);

  return (
    <nav aria-label="Steps" className="flex flex-wrap gap-1 text-sm font-bold">
      {STEPS.map((s, i) => (
        <Link
          key={s.href}
          href={s.href}
          aria-current={i === current ? "step" : undefined}
          className={`rounded-full px-3 py-1 ${
            i === current ? "bg-violet-600 text-white" : "text-violet-700 hover:bg-violet-100"
          }`}
        >
          {i + 1}. {s.label}
        </Link>
      ))}
    </nav>
  );
}

function AccountMenu() {
  const router = useRouter();
  const { status, available, adult, kid, signOut } = useAuth();
  const { restart } = useStore();

  if (!available || status === "loading") return null;

  async function leave() {
    await signOut();
    restart(); // never leave one person's progress on a shared device
    router.push("/");
  }

  if (status === "kid" && kid) {
    return (
      <div className="flex items-center gap-2 text-base">
        <span className="font-extrabold text-violet-900">Hi {kid.nickname}! 👋</span>
        <button onClick={leave} className={linkStyle}>
          Sign out
        </button>
      </div>
    );
  }

  if (status === "adult" && adult) {
    return (
      <div className="flex items-center gap-1 text-base">
        <Link href="/dashboard" className={linkStyle}>
          👨‍👩‍👧 Dashboard
        </Link>
        <button onClick={leave} className={linkStyle}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-base">
      <Link href="/login" className={linkStyle}>
        Sign in
      </Link>
      <Link href="/signup" className="rounded-full bg-orange-500 px-4 py-1 font-extrabold text-white hover:bg-orange-400">
        Sign up
      </Link>
    </div>
  );
}

function PlayingBanner() {
  const router = useRouter();
  const { playing, playAs } = useAuth();
  const { restart } = useStore();
  if (!playing) return null;
  return (
    <div className="no-print bg-amber-100 py-1 text-center text-base font-bold text-amber-950">
      Playing as {playing.nickname} 🎮{" "}
      <button
        className="ml-2 underline"
        onClick={() => {
          playAs(null);
          restart();
          router.push("/dashboard");
        }}
      >
        Back to dashboard
      </button>
    </div>
  );
}
