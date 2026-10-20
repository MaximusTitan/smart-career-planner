import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

/**
 * Browser Supabase client (publishable key). Handles sign-up and sign-in (the session
 * lives in the browser) and saves each person's own progress row, which Row Level
 * Security limits to its owner. Returns null when env vars are missing.
 */
export function getBrowserSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  client = url && key ? createClient(url, key) : null;
  return client;
}
