import { getSupabase } from "./supabase";

/**
 * Server-side login check for API routes: the request must carry a valid Supabase
 * access token (`Authorization: Bearer ...`). Without this, anyone could call the AI
 * routes directly and spend your AI credits.
 */
export async function isSignedIn(request: Request): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return false;

  const { data, error } = await supabase.auth.getUser(token);
  return !error && Boolean(data.user);
}

export function unauthorized() {
  return Response.json({ error: "Please sign in first." }, { status: 401 });
}
