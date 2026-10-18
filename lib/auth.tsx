"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getBrowserSupabase } from "./supabase-browser";
import type { SavedState } from "./types";

export type Adult = { id: string; email: string; name: string; role: string };
export type SignedInKid = { id: string; secret: string; nickname: string };
export type PlayingKid = { id: string; nickname: string };

type Status = "loading" | "anon" | "adult" | "kid";

type Result = { ok: true } | { ok: false; error: string };

type Auth = {
  status: Status;
  /** false when Supabase env vars are missing: accounts are switched off */
  available: boolean;
  adult: Adult | null;
  /** A student who signed in on this device with a join code and PIN */
  kid: SignedInKid | null;
  /** An adult who opened a kid's profile to play as them */
  playing: PlayingKid | null;
  signUp: (input: { email: string; password: string; name: string; role: string }) => Promise<Result & { needsConfirm?: boolean }>;
  signIn: (email: string, password: string) => Promise<Result>;
  kidSignIn: (code: string, pin: string) => Promise<Result & { data?: Partial<SavedState> }>;
  playAs: (kid: PlayingKid | null) => void;
  signOut: () => Promise<void>;
};

const KEY = "dream-jobs-auth-v1";

const Ctx = createContext<Auth>({
  status: "loading",
  available: false,
  adult: null,
  kid: null,
  playing: null,
  signUp: async () => ({ ok: false, error: "Not ready" }),
  signIn: async () => ({ ok: false, error: "Not ready" }),
  kidSignIn: async () => ({ ok: false, error: "Not ready" }),
  playAs: () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(Ctx);
}

function readLocal(): { kid: SignedInKid | null; playing: PlayingKid | null } {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { kid: null, playing: null, ...JSON.parse(raw) };
  } catch {
    // blocked storage: start signed out
  }
  return { kid: null, playing: null };
}

function writeLocal(value: { kid: SignedInKid | null; playing: PlayingKid | null }) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // ignore
  }
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [adult, setAdult] = useState<Adult | null>(null);
  const [kid, setKid] = useState<SignedInKid | null>(null);
  const [playing, setPlaying] = useState<PlayingKid | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getBrowserSupabase();
  const available = supabase !== null;

  useEffect(() => {
    const local = readLocal();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setKid(local.kid);
    if (!supabase) {
      setLoading(false);
      return;
    }

    const toAdult = (user: { id: string; email?: string; user_metadata?: Record<string, unknown> } | undefined): Adult | null =>
      user
        ? {
            id: user.id,
            email: user.email ?? "",
            name: String(user.user_metadata?.display_name ?? ""),
            role: String(user.user_metadata?.role ?? ""),
          }
        : null;

    supabase.auth.getSession().then(({ data }) => {
      const a = toAdult(data.session?.user);
      setAdult(a);
      // "Playing as" only makes sense while the adult is still signed in.
      setPlaying(a ? local.playing : null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const a = toAdult(session?.user);
      setAdult(a);
      if (!a) setPlaying(null);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!loading) writeLocal({ kid, playing });
  }, [kid, playing, loading]);

  const signUp = useCallback<Auth["signUp"]>(
    async ({ email, password, name, role }) => {
      if (!supabase) return { ok: false, error: "Accounts aren't switched on yet." };
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: name, role },
          emailRedirectTo: `${location.origin}/dashboard`,
        },
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
      if (error) return { ok: false, error: friendly(error.message) };
      setKid(null);
      return { ok: true };
    },
    [supabase],
  );

  const kidSignIn = useCallback<Auth["kidSignIn"]>(
    async (code, pin) => {
      if (!supabase) return { ok: false, error: "Accounts aren't switched on yet." };
      const { data, error } = await supabase.rpc("kid_sign_in", { p_code: code, p_pin: pin });
      if (error) {
        return {
          ok: false,
          error: error.message.includes("locked")
            ? "Too many wrong tries. Ask your grown-up for help, or wait 15 minutes."
            : "Something went wrong. Please try again.",
        };
      }
      if (!data) return { ok: false, error: "That code or PIN isn't right. Check with your grown-up!" };
      setKid({ id: data.kid_id, secret: data.secret, nickname: data.nickname });
      setPlaying(null);
      return { ok: true, data: data.data as Partial<SavedState> };
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    setKid(null);
    setPlaying(null);
    await supabase?.auth.signOut();
  }, [supabase]);

  const value = useMemo<Auth>(
    () => ({
      status: loading ? "loading" : kid ? "kid" : adult ? "adult" : "anon",
      available,
      adult,
      kid,
      playing,
      signUp,
      signIn,
      kidSignIn,
      playAs: setPlaying,
      signOut,
    }),
    [loading, kid, adult, playing, available, signUp, signIn, kidSignIn, signOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
