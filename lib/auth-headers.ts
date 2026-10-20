import { getBrowserSupabase } from "./supabase-browser";

/** Header that proves who is calling our API routes (checked in lib/api-auth.ts). */
export async function authHeaders(): Promise<Record<string, string>> {
  const { data } = (await getBrowserSupabase()?.auth.getSession()) ?? {};
  const token = data?.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
