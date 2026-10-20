"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getBrowserSupabase } from "./supabase-browser";

export type User = { id: string; email: string; name: string };

type Status = "loading" | "anon" | "user";

type Result = { ok: true } | { ok: false; error: string };

type Auth = {
  status: Status;
  /** false when Supabase env vars are missing: accounts are switched off */
  available: boolean;
  user: User | null;
  signUp: (input: { email: string; password: string; name: string }) => Promise<Result & { needsConfirm?: boolean }>;
  signIn: (email: string, password: string) => Promise<Result>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<Auth>({
  status: "loading",
  available: false,
  user: null,
  signUp: async () => ({ ok: false, error: "Not ready" }),
  signIn: async () => ({ ok: false, error: "Not ready" }),
  signOut: async () => {},
});

export function useAuth() {
  return useContext(Ctx);
}

function friendly(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "That email or password isn't right.";
  if (m.includes("email not confirmed")) return "Please open the confirmation email we sent you first.";
  if (m.includes("already registered")) return "That email already has an account. Try signing in.";
  if (m.includes("password")) return "Your password needs at least 8 characters.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many tries. Please wait a minute and try again.";
  return "Something went wrong. Please try again.";
}

type SupabaseUser = { id: string; email?: string; user_metadata?: Record<string, unknown> };

function toUser(u: SupabaseUser | undefined | null): User | null {
  return u ? { id: u.id, email: u.email ?? "", name: String(u.user_metadata?.display_name ?? "") } : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getBrowserSupabase();

  useEffect(() => {
    if (!supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setUser(toUser(data.session?.user));
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toUser(session?.user));
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const signUp = useCallback<Auth["signUp"]>(
    async ({ email, password, name }) => {
      if (!supabase) return { ok: false, error: "Accounts aren't switched on yet." };
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: name }, emailRedirectTo: `${location.origin}/` },
      });
      if (error) return { ok: false, error: friendly(error.message) };
      return { ok: true, needsConfirm: !data.session };
    },
    [supabase],
  );

  const signIn = useCallback<Auth["signIn"]>(
    async (email, password) => {
      if (!supabase) return { ok: false, error: "Accounts aren't switched on yet." };
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error ? { ok: false, error: friendly(error.message) } : { ok: true };
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
  }, [supabase]);

  const value = useMemo<Auth>(
    () => ({
      status: loading ? "loading" : user ? "user" : "anon",
      available: supabase !== null,
      user,
      signUp,
      signIn,
      signOut,
    }),
    [loading, user, supabase, signUp, signIn, signOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
