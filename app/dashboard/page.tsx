"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Field, FormError } from "@/components/AuthForm";
import { Loading } from "@/components/Loading";
import { Ollie } from "@/components/Ollie";
import { Button, ButtonLink, Card, Chip } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { profileLabels } from "@/lib/options";
import { useStore } from "@/lib/store";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import type { SavedState } from "@/lib/types";

type KidRow = {
  id: string;
  nickname: string;
  grade: number | null;
  join_code: string;
  data: Partial<SavedState>;
  updated_at: string;
};

export default function Dashboard() {
  const router = useRouter();
  const { status, adult, playAs } = useAuth();
  const store = useStore();
  const supabase = getBrowserSupabase();

  const [kids, setKids] = useState<KidRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("kids")
      .select("id,nickname,grade,join_code,data,updated_at")
      .order("created_at");
    if (error) setError("Could not load your kids. Please refresh.");
    else setKids(data as KidRow[]);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (status === "adult") load();
  }, [status, load]);

  if (status === "loading") return <Loading />;

  if (status !== "adult" || !adult) {
    return (
      <div className="mx-auto max-w-xl space-y-4 text-center">
        <Ollie size={110} className="mx-auto" />
        <h1 className="text-3xl font-black text-violet-950">Grown-ups only 🔒</h1>
        <p className="text-xl font-semibold">Sign in to see your kids&apos; dashboard.</p>
        <div className="flex justify-center gap-3">
          <ButtonLink href="/login">Sign in</ButtonLink>
          <ButtonLink href="/signup" variant="secondary">
            Sign up
          </ButtonLink>
        </div>
      </div>
    );
  }

  function playAsKid(kid: KidRow) {
    playAs({ id: kid.id, nickname: kid.nickname });
    store.adopt(kid.data);
    router.push(kid.data.careers?.length ? "/jobs" : "/");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-violet-950">
          {adult.role === "Teacher" ? "Your class" : "Your family"} 👨‍👩‍👧
        </h1>
        <p className="text-lg font-semibold text-slate-600">
          Hi {adult.name || adult.email}! Add each child, then see what they love and which jobs they are exploring.
        </p>
      </div>

      {error && <FormError>{error}</FormError>}

      <AddKid
        hasLocalProgress={store.profile.subjects.length + store.profile.loves.length > 0}
        onAdd={async (nickname, grade, pin, useLocal) => {
          if (!supabase) return "Accounts aren't switched on yet.";
          const { error } = await supabase.rpc("create_kid", {
            p_nickname: nickname,
            p_grade: grade,
            p_pin: pin,
            p_data: useLocal
              ? { profile: store.profile, careers: store.careers, selectedId: store.selectedId, source: store.source }
              : {},
          });
          if (error) return error.message.includes("PIN") ? "The PIN must be 4 numbers." : "Could not add this child. Please try again.";
          await load();
          return null;
        }}
      />

      {kids === null ? (
        <Loading />
      ) : kids.length === 0 ? (
        <p className="text-center text-xl font-semibold">No kids yet. Add your first one above! 👆</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {kids.map((k) => (
            <KidCard
              key={k.id}
              kid={k}
              onPlay={() => playAsKid(k)}
              onChanged={load}
              onError={setError}
            />
          ))}
        </ul>
      )}

      <p className="text-center text-base font-semibold text-slate-600">
        Kids sign in at{" "}
        <Link href="/login" className="font-extrabold text-violet-700 underline">
          /login
        </Link>{" "}
        with their code and PIN. Only you can see this page.
      </p>
    </div>
  );
}

function AddKid({
  hasLocalProgress,
  onAdd,
}: {
  hasLocalProgress: boolean;
  onAdd: (nickname: string, grade: number | null, pin: string, useLocal: boolean) => Promise<string | null>;
}) {
  const [nickname, setNickname] = useState("");
  const [grade, setGrade] = useState<number | null>(null);
  const [pin, setPin] = useState("");
  const [useLocal, setUseLocal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const problem = await onAdd(nickname.trim(), grade, pin, useLocal);
    setBusy(false);
    if (problem) return setError(problem);
    setNickname("");
    setPin("");
    setGrade(null);
    setUseLocal(false);
  }

  return (
    <Card>
      <form onSubmit={submit} className="space-y-4">
        <h2 className="text-2xl font-black text-violet-900">Add a child</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value.slice(0, 20))}
            maxLength={20}
            autoComplete="off"
            hint="Not their full name, please."
            required
          />
          <Field
            label="Make a 4-number PIN"
            type="password"
            inputMode="numeric"
            pattern="[0-9]{4}"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            autoComplete="off"
            hint="They'll use it to sign in."
            required
          />
        </div>
        <fieldset className="space-y-2">
          <legend className="text-lg font-extrabold text-violet-900">Grade</legend>
          <div className="flex gap-2">
            {[4, 5, 6].map((g) => (
              <Chip key={g} selected={grade === g} onClick={() => setGrade(grade === g ? null : g)}>
                Grade {g}
              </Chip>
            ))}
          </div>
        </fieldset>
        {hasLocalProgress && (
          <label className="flex items-start gap-3 text-lg font-semibold">
            <input
              type="checkbox"
              checked={useLocal}
              onChange={(e) => setUseLocal(e.target.checked)}
              className="mt-1 size-6 accent-violet-600"
            />
            Start from the answers and jobs already on this device
          </label>
        )}
        {error && <FormError>{error}</FormError>}
        <Button type="submit" disabled={busy || !nickname.trim() || pin.length !== 4}>
          {busy ? "Adding…" : "Add child"}
        </Button>
      </form>
    </Card>
  );
}

function KidCard({
  kid,
  onPlay,
  onChanged,
  onError,
}: {
  kid: KidRow;
  onPlay: () => void;
  onChanged: () => Promise<void>;
  onError: (message: string | null) => void;
}) {
  const supabase = getBrowserSupabase();
  const [newPin, setNewPin] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const profile = kid.data.profile;
  const interests = profile ? profileLabels(profile) : [];
  const careers = kid.data.careers ?? [];
  const chosen = careers.find((c) => c.id === kid.data.selectedId);
  const missions = chosen ? chosen.roadmap.slice(0, 3).map((s) => s.mission) : [];
  const done = missions.filter((m) => kid.data.doneMissions?.includes(m)).length;

  async function savePin() {
    if (!supabase || !newPin) return;
    onError(null);
    const { error } = await supabase.rpc("set_kid_pin", { p_kid: kid.id, p_pin: newPin });
    if (error) return onError("Could not change the PIN. It must be 4 numbers.");
    setNewPin(null);
    setNote("New PIN saved. Any device signed in as this child has been signed out.");
  }

  async function remove() {
    if (!supabase) return;
    if (!confirm(`Remove ${kid.nickname} and all their saved answers? This cannot be undone.`)) return;
    const { error } = await supabase.from("kids").delete().eq("id", kid.id);
    if (error) onError("Could not remove this child. Please try again.");
    else await onChanged();
  }

  return (
    <li>
      <Card className="h-full space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-2xl font-black text-violet-950">
            {kid.nickname}
            {kid.grade ? <span className="ml-2 text-lg font-bold text-slate-500">Grade {kid.grade}</span> : null}
          </h2>
          <span className="rounded-full bg-violet-100 px-3 py-1 font-mono text-lg font-extrabold text-violet-900">
            {kid.join_code}
          </span>
        </div>

        <div>
          <p className="text-sm font-extrabold tracking-wide text-violet-700 uppercase">Loves</p>
          <p className="text-lg font-semibold">
            {interests.length ? [...new Set(interests)].join(" · ") : "Hasn't answered the questions yet"}
          </p>
        </div>

        {careers.length > 0 && (
          <div>
            <p className="text-sm font-extrabold tracking-wide text-violet-700 uppercase">Top job ideas</p>
            <p className="text-lg font-semibold">
              {careers
                .slice(0, 3)
                .map((c) => `${c.emoji} ${c.title}`)
                .join(" · ")}
            </p>
          </div>
        )}

        {chosen && (
          <div>
            <p className="text-sm font-extrabold tracking-wide text-violet-700 uppercase">Dream job</p>
            <p className="text-lg font-semibold">
              {chosen.emoji} {chosen.title}: {done} of {missions.length} missions done
            </p>
          </div>
        )}

        {note && <p className="rounded-xl bg-sky-100 p-2 text-base font-bold text-sky-900">{note}</p>}

        {newPin === null ? (
          <div className="flex flex-wrap gap-2">
            <Button onClick={onPlay}>▶ Play as {kid.nickname}</Button>
            <Button variant="secondary" onClick={() => { setNewPin(""); setNote(null); }}>
              Change PIN
            </Button>
            <Button variant="ghost" onClick={remove}>
              Remove
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-end gap-2">
            <Field
              label="New 4-number PIN"
              type="password"
              inputMode="numeric"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              autoComplete="off"
            />
            <Button onClick={savePin} disabled={newPin.length !== 4}>
              Save
            </Button>
            <Button variant="ghost" onClick={() => setNewPin(null)}>
              Cancel
            </Button>
          </div>
        )}
      </Card>
    </li>
  );
}
