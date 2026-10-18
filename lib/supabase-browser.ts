import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

/**
 * Browser Supabase client (publishable key). Used for adult sign-up/sign-in
 * (the session lives in the browser) and for kid sign-in / saving through the
 * RPC functions in supabase/schema.sql. Returns null when env vars are missing.
 */
export function getBrowserSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  client = url && key ? createClient(url, key) : null;
  return client;
}
