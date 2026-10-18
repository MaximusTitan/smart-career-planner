"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AccountsOff, Field, FormError } from "@/components/AuthForm";
import { Ollie } from "@/components/Ollie";
import { Button, Card, Chip } from "@/components/ui";
import { useAuth } from "@/lib/auth";

export default function SignUp() {
  const router = useRouter();
  const { available, status, signUp } = useAuth();
  const [role, setRole] = useState("Parent");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adultOk, setAdultOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Your password needs at least 8 characters.");
    setBusy(true);
    const res = await signUp({ email: email.trim(), password, name: name.trim(), role });
    setBusy(false);
    if (!res.ok) return setError(res.error);
    if (res.needsConfirm) setConfirmSent(true);
    else router.push("/dashboard");
  }

  if (confirmSent) {
    return (
      <div className="mx-auto max-w-xl space-y-4 text-center">
        <Ollie size={110} className="mx-auto" />
        <h1 className="text-3xl font-black text-violet-950">Check your email! 📬</h1>
        <p className="text-xl font-semibold">
          We sent a link to <b>{email}</b>. Open it to finish signing up, then come back and sign in.
        </p>
        <Button onClick={() => router.push("/login")}>Go to sign in</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="flex items-center gap-4">
        <Ollie size={80} />
        <div>
          <h1 className="text-3xl font-black text-violet-950">Grown-up sign up</h1>
          <p className="text-lg font-semibold text-slate-600">
            For parents and teachers. Kids don&apos;t need an email: you add them in your dashboard.
          </p>
        </div>
      </div>

      {!available ? (
        <AccountsOff />
      ) : status === "adult" || status === "kid" ? (
        <FormError>You&apos;re already signed in.</FormError>
      ) : (
        <Card>
          <form onSubmit={submit} className="space-y-4">
            <fieldset className="space-y-2">
              <legend className="text-lg font-extrabold text-violet-900">I am a…</legend>
              <div className="flex gap-2">
                {["Parent", "Teacher"].map((r) => (
                  <Chip key={r} selected={role === r} onClick={() => setRole(r)}>
                    {r}
                  </Chip>
                ))}
              </div>
            </fieldset>
            <Field
              label="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              maxLength={40}
              required
            />
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              hint="At least 8 characters."
              required
            />
            <label className="flex items-start gap-3 text-lg font-semibold">
              <input
                type="checkbox"
                checked={adultOk}
                onChange={(e) => setAdultOk(e.target.checked)}
                className="mt-1 size-6 accent-violet-600"
              />
              I am 18 or older, and I will use a nickname for any child (never their full name).
            </label>
            {error && <FormError>{error}</FormError>}
            <Button type="submit" disabled={busy || !adultOk} className="w-full">
              {busy ? "Creating…" : "Create my account"}
            </Button>
          </form>
        </Card>
      )}

      <p className="text-center text-lg font-semibold">
        Already have an account?{" "}
        <Link href="/login" className="font-extrabold text-violet-700 underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
