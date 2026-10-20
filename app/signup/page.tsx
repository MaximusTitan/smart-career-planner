"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AccountsOff, Field, FormError } from "@/components/AuthForm";
import { Ollie } from "@/components/Ollie";
import { Button, Card } from "@/components/ui";
import { useAuth } from "@/lib/auth";

export default function SignUp() {
  const router = useRouter();
  const { available, status, signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Your password needs at least 8 characters.");
    setBusy(true);
    const res = await signUp({ email: email.trim(), password, name: name.trim() });
    setBusy(false);
    if (!res.ok) return setError(res.error);
    if (res.needsConfirm) setConfirmSent(true);
    else router.push("/");
  }

  if (confirmSent) {
    return (
      <div className="mx-auto max-w-xl space-y-4 text-center">
        <Ollie size={110} className="mx-auto" />
        <h1 className="text-3xl font-black text-violet-950">Check your email! 📬</h1>
        <p className="text-xl font-semibold">
          We sent a link to <b>{email}</b>. Open it to finish signing up, then sign in.
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
          <h1 className="text-3xl font-black text-violet-950">Create your account</h1>
          <p className="text-lg font-semibold text-slate-600">
            Younger than 13? Ask a grown-up to help you sign up.
          </p>
        </div>
      </div>

      {!available ? (
        <AccountsOff />
      ) : status === "user" ? (
        <Card className="space-y-3">
          <p className="text-xl font-bold">You&apos;re already signed in.</p>
          <Button onClick={() => router.push("/")}>Go to the app</Button>
        </Card>
      ) : (
        <Card>
          <form onSubmit={submit} className="space-y-4">
            <Field
              label="What should I call you?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="given-name"
              maxLength={20}
              hint="A first name or nickname is perfect."
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
            {error && <FormError>{error}</FormError>}
            <Button type="submit" disabled={busy} className="w-full">
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
