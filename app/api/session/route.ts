import { z } from "zod";
import { getSupabase } from "@/lib/supabase";

const idSchema = z.string().uuid();

// Saves a kid's answers so the app can remember them next time.
export async function PUT(request: Request) {
  const supabase = getSupabase();
  if (!supabase) return Response.json({ stored: false });

  const body = await request.json().catch(() => null);
  const id = idSchema.safeParse(body?.id);
  if (!id.success || typeof body?.data !== "object" || JSON.stringify(body.data).length > 200_000) {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const { error } = await supabase.rpc("save_session", { p_id: id.data, p_data: body.data });
  if (error) {
    console.error("session save failed", error.message);
    return Response.json({ stored: false });
  }
  return Response.json({ stored: true });
}
