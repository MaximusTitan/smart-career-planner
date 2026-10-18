"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ollie } from "./Ollie";

const STEPS = [
  { href: "/", label: "About me" },
  { href: "/quiz", label: "Quiz" },
  { href: "/jobs", label: "Jobs" },
  { href: "/detail", label: "Detail" },
  { href: "/map", label: "Map" },
  { href: "/compare", label: "Compare" },
  { href: "/plan", label: "My plan" },
];

export function Header() {
  const pathname = usePathname();
  const current = STEPS.findIndex((s) => s.href === pathname);

  return (
    <header className="border-b-2 border-violet-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-2xl font-black text-violet-800">
          <Ollie size={40} />
          Dream Jobs
        </Link>
        <nav aria-label="Steps" className="flex flex-wrap gap-1 text-sm font-bold">
          {STEPS.map((s, i) => (
            <Link
              key={s.href}
              href={s.href}
              aria-current={i === current ? "step" : undefined}
              className={`rounded-full px-3 py-1 ${
                i === current
                  ? "bg-violet-600 text-white"
                  : "text-violet-700 hover:bg-violet-100"
              }`}
            >
              {i + 1}. {s.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
