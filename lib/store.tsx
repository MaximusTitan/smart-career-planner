"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Career, Profile } from "./types";
import { EMPTY_PROFILE } from "./options";

type SavedState = {
  sessionId: string;
  profile: Profile;
  careers: Career[];
  selectedId: string | null;
  compareIds: string[];
  savedIds: string[];
  doneMissions: string[];
  source: "ai" | "offline" | null;
};

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
  restart: () => void;
};

const KEY = "dream-jobs-v1";

function freshState(): SavedState {
  return {
    sessionId: crypto.randomUUID(),
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

/** What pages see on the server and before the browser's saved state has loaded. */
const PRE_READY: Store = {
  ...{ sessionId: "", profile: EMPTY_PROFILE, careers: [], selectedId: null, compareIds: [], savedIds: [], doneMissions: [], source: null },
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
  restart: noop,
};

const Ctx = createContext<Store>(PRE_READY);

export function useStore() {
  return useContext(Ctx);
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SavedState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Load the saved state in the browser after first paint (keeps server and client HTML identical).
  useEffect(() => {
    let loaded: SavedState | null = null;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) loaded = { ...freshState(), ...JSON.parse(raw) };
    } catch {
      // storage can be blocked; we just start fresh
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loaded ?? freshState());
  }, []);

  // Save locally on every change, and to Supabase a moment after the last change.
  useEffect(() => {
    if (!state) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      fetch("/api/session", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: state.sessionId, data: state }),
      }).catch(() => {});
    }, 1500);
    return () => clearTimeout(syncTimer.current);
  }, [state]);

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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(state.profile),
          });
          if (!res.ok) throw new Error("Request failed");
          const data = (await res.json()) as { careers: Career[]; source: "ai" | "offline" };
          patch({
            careers: data.careers,
            source: data.source,
            selectedId: data.careers[0]?.id ?? null,
            compareIds: [],
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
      restart: () => patch({ ...freshState(), sessionId: state.sessionId }),
    };
  }, [state, loading, error, patch]);

  return <Ctx.Provider value={value ?? PRE_READY}>{children}</Ctx.Provider>;
}
