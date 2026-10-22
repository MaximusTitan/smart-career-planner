"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Career, Profile, SavedState } from "./types";
import { useAuth } from "./auth";
import { getBrowserSupabase } from "./supabase-browser";
import { authHeaders } from "./auth-headers";
import { EMPTY_PROFILE, profileKey } from "./options";

type Store = SavedState & {
  ready: boolean;
  loading: boolean;
  error: string | null;
  selected: Career | null;
  updateProfile: (patch: Partial<Profile>) => void;
  findJobs: () => Promise<boolean>;
  select: (id: string) => void;
  toggleCompare: (id: string) => void;
  toggleSaved: (id: string) => void;
  toggleMission: (mission: string) => void;
};

function freshState(): SavedState {
  return {
    profile: EMPTY_PROFILE,
    careers: [],
    selectedId: null,
    compareIds: [],
    savedIds: [],
    doneMissions: [],
    source: null,
  };
}

const noop = () => {};

/** What pages see on the server and while the signed-in person's saved progress loads. */
const PRE_READY: Store = {
  ...{ profile: EMPTY_PROFILE, careers: [], selectedId: null, compareIds: [], savedIds: [], doneMissions: [], source: null },
  ready: false,
  loading: false,
  error: null,
  selected: null,
  updateProfile: noop,
  findJobs: async () => false,
  select: noop,
  toggleCompare: noop,
  toggleSaved: noop,
  toggleMission: noop,
};

const Ctx = createContext<Store>(PRE_READY);

export function useStore() {
  return useContext(Ctx);
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SavedState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // The person whose saved progress has loaded. We only save for them, so a failed load
  // can never overwrite their real progress with an empty one.
  const loadedFor = useRef<string | null>(null);
  const { status, user } = useAuth();
  const userId = user?.id ?? null;
  const userName = user?.name ?? "";

  // When someone signs in, load their saved progress. When they sign out, start fresh.
  useEffect(() => {
    if (status === "loading") return;
    loadedFor.current = null;
    const supabase = getBrowserSupabase();
    if (!userId || !supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState(freshState());
      return;
    }

    setState(null);
    let cancelled = false;
    supabase
      .from("progress")
      .select("data")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data, error: loadError }) => {
        if (cancelled) return;
        const saved = (data?.data ?? {}) as Partial<SavedState>;
        const next = { ...freshState(), ...saved };
        if (!next.profile.name) next.profile = { ...next.profile, name: userName };
        setState(next);
        if (loadError) setError("Could not load your saved progress. Please refresh.");
        else loadedFor.current = userId;
      });
    return () => {
      cancelled = true;
    };
  }, [status, userId, userName]);

  // Save a moment after the last change.
  useEffect(() => {
    if (!state || !userId || loadedFor.current !== userId) return;
    saveTimer.current = setTimeout(() => {
      getBrowserSupabase()
        ?.from("progress")
        .upsert({ user_id: userId, data: state, updated_at: new Date().toISOString() })
        .then(() => {});
    }, 1000);
    return () => clearTimeout(saveTimer.current);
  }, [state, userId]);

  const patch = useCallback((p: Partial<SavedState>) => {
    setState((s) => (s ? { ...s, ...p } : s));
  }, []);

  const value = useMemo<Store | null>(() => {
    if (!state) return null;
    const toggle = (list: string[], id: string, max = Infinity) =>
      list.includes(id) ? list.filter((x) => x !== id) : [...list, id].slice(-max);
    return {
      ...state,
      ready: true,
      loading,
      error,
      selected: state.careers.find((c) => c.id === state.selectedId) ?? null,
      updateProfile: (p) => setState((s) => (s ? { ...s, profile: { ...s.profile, ...p } } : s)),
      findJobs: async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await fetch("/api/careers", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...(await authHeaders()) },
            body: JSON.stringify(state.profile),
          });
          if (res.status === 401) {
            setError("Please sign out and sign in again.");
            return false;
          }
          if (!res.ok) throw new Error("Request failed");
          const data = (await res.json()) as { careers: Career[]; source: "ai" | "offline" };
          patch({
            careers: data.careers,
            source: data.source,
            selectedId: data.careers[0]?.id ?? null,
            compareIds: [],
            careersFor: profileKey(state.profile),
          });
          return true;
        } catch {
          setError("Oh no, Ollie got tangled up. Let's try again!");
          return false;
        } finally {
          setLoading(false);
        }
      },
      select: (id) => patch({ selectedId: id }),
      toggleCompare: (id) => patch({ compareIds: toggle(state.compareIds, id, 2) }),
      toggleSaved: (id) => patch({ savedIds: toggle(state.savedIds, id) }),
      toggleMission: (m) => patch({ doneMissions: toggle(state.doneMissions, m) }),
    };
  }, [state, loading, error, patch]);

  return <Ctx.Provider value={value ?? PRE_READY}>{children}</Ctx.Provider>;
}
