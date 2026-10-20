"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AccountsOff, Field, FormError } from "@/components/AuthForm";
import { Ollie } from "@/components/Ollie";
import { Button, Card } from "@/components/ui";
import { useAuth } from "@/lib/auth";

export default function Login() {
  const router = useRouter();
  const { available, status, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await signIn(email.trim(), password);
    setBusy(false);
    if (res.ok) router.push("/");
    else setError(res.error);
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="flex items-center gap-4">
        <Ollie size={80} />
        <div>
          <h1 className="text-3xl font-black text-violet-950">Welcome back!</h1>
          <p className="text-lg font-semibold text-slate-600">Sign in to find what you could become.</p>
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
              autoComplete="current-password"
              required
            />
            {error && <FormError>{error}</FormError>}
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </Card>
      )}

      <p className="text-center text-lg font-semibold">
        New here?{" "}
        <Link href="/signup" className="font-extrabold text-violet-700 underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
