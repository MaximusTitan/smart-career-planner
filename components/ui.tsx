import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-lg font-extrabold transition active:scale-95 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sky-400 disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  primary: "bg-orange-500 text-white shadow-[0_5px_0_#c2410c] hover:bg-orange-400",
  secondary: "bg-white text-violet-700 border-2 border-violet-300 hover:bg-violet-50",
  success: "bg-emerald-500 text-white shadow-[0_5px_0_#047857] hover:bg-emerald-400",
  ghost: "text-violet-700 hover:bg-violet-100",
};

type Variant = keyof typeof variants;

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function Chip({
  selected,
  emoji,
  children,
  ...props
}: ComponentProps<"button"> & { selected?: boolean; emoji?: string }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`flex min-h-12 items-center gap-2 rounded-2xl border-2 px-4 py-2 text-left text-lg font-bold transition active:scale-95 focus-visible:outline-4 focus-visible:outline-sky-400 ${
        selected
          ? "border-violet-600 bg-violet-600 text-white shadow-md"
          : "border-violet-200 bg-white text-slate-800 hover:border-violet-400"
      }`}
      {...props}
    >
      {emoji && <span aria-hidden>{emoji}</span>}
      {children}
    </button>
  );
}

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`rounded-3xl border-2 border-violet-100 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function ChipGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-xl font-extrabold text-violet-900">{title}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

export function Icons({ count, total = 4, icon }: { count: number; total?: number; icon: string }) {
  return (
    <span aria-label={`${count} out of ${total}`} className="text-2xl tracking-wide">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < count ? "" : "opacity-20 grayscale"} aria-hidden>
          {icon}
        </span>
      ))}
    </span>
  );
}

export const FIT_LABEL = { great: "Great fit", good: "Good fit", maybe: "Worth a look" } as const;
export const FIT_STYLE = {
  great: "bg-emerald-100 text-emerald-800",
  good: "bg-sky-100 text-sky-800",
  maybe: "bg-amber-100 text-amber-800",
} as const;
