"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

const STEPS = [
  { href: "/", label: "About me" },
  { href: "/quiz", label: "Quiz" },
  { href: "/jobs", label: "Jobs" },
  { href: "/detail", label: "Detail" },
  { href: "/map", label: "Map" },
  { href: "/compare", label: "Compare" },
  { href: "/plan", label: "My plan" },
];

const SAVED = { href: "/saved", label: "⚡ Saved plans" };

const linkStyle = "rounded-full px-3 py-1 font-bold text-violet-700 hover:bg-violet-100";

export function Header() {
  return (
    <header className="border-b-2 border-violet-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3">
        <Link href="/" aria-label="Smart Career Planner home">
          <Image src="/logo.png" alt="Smart Career Planner" width={1014} height={239} priority className="h-11 w-auto" />
        </Link>
        <AccountMenu />
        {/* usePathname needs the URL, so it streams in behind Suspense */}
        <Suspense fallback={<div className="h-8 w-full" aria-hidden />}>
          <StepNav />
        </Suspense>
      </div>
    </header>
  );
}

function StepNav() {
  const pathname = usePathname();
  const { status } = useAuth();
  // The steps are only for someone who is signed in.
  if (status !== "user") return null;
  const current = STEPS.findIndex((s) => s.href === pathname);

  return (
    <nav aria-label="Steps" className="flex w-full flex-wrap justify-center gap-1 text-sm font-bold">
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
      <Link
        href={SAVED.href}
        aria-current={pathname === SAVED.href ? "page" : undefined}
        className={`rounded-full px-3 py-1 ${
          pathname === SAVED.href ? "bg-violet-600 text-white" : "text-violet-700 hover:bg-violet-100"
        }`}
      >
        {SAVED.label}
      </Link>
    </nav>
  );
}

function AccountMenu() {
  const router = useRouter();
  const { status, available, user, signOut } = useAuth();

  if (!available || status === "loading") return null;

  if (user) {
    return (
      <div className="flex items-center gap-2 text-base">
        <span className="font-extrabold text-violet-900">Hi {user.name || "there"}! 👋</span>
        <button
          onClick={async () => {
            await signOut();
            router.push("/login");
          }}
          className={linkStyle}
        >
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
