import type { PlayingKid, SignedInKid } from "./auth";
import { getBrowserSupabase } from "./supabase-browser";
import type { SavedState } from "./types";

export type SyncTarget = {
  /** A student signed in on this device */
  kid: SignedInKid | null;
  /** An adult playing as one of their kids */
  playing: PlayingKid | null;
  adultSignedIn: boolean;
};

/**
 * Saves progress to the right place:
 * - a signed-in student -> their kid profile (needs the id + secret)
 * - an adult playing as a kid -> that kid's row (allowed by Row Level Security)
 * - everyone else -> the anonymous session
 */
export async function syncState(target: SyncTarget, state: SavedState) {
  const { sessionId, ...data } = state;
  const supabase = getBrowserSupabase();

  if (target.kid && supabase) {
    await supabase.rpc("kid_save", { p_kid: target.kid.id, p_secret: target.kid.secret, p_data: data });
  } else if (target.adultSignedIn && target.playing && supabase) {
    await supabase
      .from("kids")
      .update({ data, updated_at: new Date().toISOString() })
      .eq("id", target.playing.id);
  } else {
    await fetch("/api/session", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: sessionId, data: state }),
    });
  }
}
