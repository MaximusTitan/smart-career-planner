import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the publishable key.
 * The tables are locked by Row Level Security, so this key can only call the
 * save_session / create_shared_plan / get_shared_plan functions in supabase/schema.sql.
 * Returns null when env vars are missing, so the app still works without a database.
 */
export function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
