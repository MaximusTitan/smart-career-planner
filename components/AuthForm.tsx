import type { ComponentProps } from "react";

export function Field({ label, hint, ...props }: ComponentProps<"input"> & { label: string; hint?: string }) {
  return (
    <label className="block space-y-1">
      <span className="text-lg font-extrabold text-violet-900">{label}</span>
      <input
        {...props}
        className="w-full rounded-2xl border-2 border-violet-200 px-4 py-3 text-xl focus:border-violet-500 focus:outline-none"
      />
      {hint && <span className="block text-base font-semibold text-slate-600">{hint}</span>}
    </label>
  );
}

export function FormError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="rounded-2xl bg-red-100 p-3 text-lg font-bold text-red-800">
      {children}
    </p>
  );
}

export function AccountsOff() {
  return (
    <p className="rounded-2xl bg-amber-100 p-4 text-lg font-bold text-amber-950">
      Accounts aren&apos;t switched on yet, so nobody can sign in. Ask whoever set up the app to add the Supabase keys.
    </p>
  );
}
