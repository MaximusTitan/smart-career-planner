"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AccountsOff, Field, FormError } from "@/components/AuthForm";
import { Ollie } from "@/components/Ollie";
import { Button, Card, Chip } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";

export default function Login() {
  const router = useRouter();
  const { available, status, signIn, kidSignIn } = useAuth();
  const { adopt } = useStore();
  const [who, setWho] = useState<"adult" | "kid">("kid");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submitAdult(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await signIn(email.trim(), password);
    setBusy(false);
    if (res.ok) router.push("/dashboard");
    else setError(res.error);
  }

  async function submitKid(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await kidSignIn(code, pin);
    setBusy(false);
    if (!res.ok) return setError(res.error);
    adopt(res.data ?? {}); // bring this student's saved progress onto the device
    router.push(res.data?.careers?.length ? "/jobs" : "/");
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="flex items-center gap-4">
        <Ollie size={80} />
        <h1 className="text-3xl font-black text-violet-950">Welcome back!</h1>
      </div>

      {!available ? (
        <AccountsOff />
      ) : status === "adult" || status === "kid" ? (
        <FormError>You&apos;re already signed in. Sign out first to use a different account.</FormError>
      ) : (
        <Card className="space-y-4">
          <div className="flex gap-2" role="group" aria-label="Who is signing in?">
            <Chip selected={who === "kid"} onClick={() => { setWho("kid"); setError(null); }}>
              🧒 I&apos;m a student
            </Chip>
            <Chip selected={who === "adult"} onClick={() => { setWho("adult"); setError(null); }}>
              👨‍👩‍👧 Parent or teacher
            </Chip>
          </div>

          {who === "kid" ? (
            <form onSubmit={submitKid} className="space-y-4">
              <Field
                label="My code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="OWL-XXXXX"
                autoComplete="off"
                autoCapitalize="characters"
                maxLength={12}
                hint="Your grown-up has this code for you."
                required
              />
              <Field
                label="My 4-number PIN"
                type="password"
                inputMode="numeric"
                pattern="[0-9]{4}"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                autoComplete="off"
                required
              />
              {error && <FormError>{error}</FormError>}
              <Button type="submit" disabled={busy || pin.length !== 4 || code.length < 6} className="w-full">
                {busy ? "Checking…" : "Let's go! 🚀"}
              </Button>
            </form>
          ) : (
            <form onSubmit={submitAdult} className="space-y-4">
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
          )}
        </Card>
      )}

      <p className="text-center text-lg font-semibold">
        New here?{" "}
        <Link href="/signup" className="font-extrabold text-violet-700 underline">
          Grown-ups: sign up
        </Link>{" "}
        or just{" "}
        <Link href="/" className="font-extrabold text-violet-700 underline">
          try it without an account
        </Link>
        .
      </p>
    </div>
  );
}
