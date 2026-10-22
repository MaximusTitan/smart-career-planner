"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

const linkClass = "font-bold text-violet-700 hover:text-violet-900 hover:underline";

export function Footer() {
  const { status } = useAuth();
  const signedIn = status === "user";

  return (
    <footer className="no-print mt-8 border-t-2 border-violet-100 bg-white/70">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-3">
          <Image src="/logo.png" alt="Smart Career Planner" width={1014} height={239} className="h-9 w-auto" />
          <p className="max-w-sm text-base font-semibold text-slate-600">
            A friendly AI career explorer for students in Grades 4 to 12. Jobs are ideas to explore, not rules.
          </p>
        </div>

        <nav aria-label="Explore" className="space-y-2 text-base">
          <p className="font-extrabold text-violet-950">Explore</p>
          <ul className="space-y-1">
            <li>
              <Link href="/" className={linkClass}>
                Home
              </Link>
            </li>
            {signedIn ? (
              <>
                <li>
                  <Link href="/quiz" className={linkClass}>
                    Quiz
                  </Link>
                </li>
                <li>
                  <Link href="/jobs" className={linkClass}>
                    My jobs
                  </Link>
                </li>
                <li>
                  <Link href="/saved" className={linkClass}>
                    Saved plans
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/login" className={linkClass}>
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className={linkClass}>
                    Sign up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className="space-y-2 text-base">
          <p className="font-extrabold text-violet-950">Good to know</p>
          <p className="font-semibold text-slate-600">
            Ollie uses AI, so suggestions can be wrong. Talk to a parent, teacher or counselor about big choices.
          </p>
        </div>
      </div>
      <div className="border-t border-violet-100 py-4 text-center text-sm font-semibold text-slate-500">
        © Smart Career Planner · Made with 💛 for curious kids
      </div>
    </footer>
  );
}
