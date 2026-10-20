import { isSignedIn, unauthorized } from "@/lib/api-auth";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { getSupabase } from "@/lib/supabase";

const planSchema = z.object({
  name: z.string().max(30),
  grade: z.number().int().nullable(),
  careerTitle: z.string().max(60),
  careerEmoji: z.string().max(8),
  loves: z.array(z.string().max(40)).max(12),
  missions: z.array(z.string().max(120)).max(5),
});

// Creates a read-only plan that family or teachers can open from a private link.
export async function POST(request: Request) {
  if (!(await isSignedIn(request))) return unauthorized();
  const supabase = getSupabase();
  if (!supabase) return Response.json({ id: null });

  const parsed = planSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request" }, { status: 400 });

  const id = randomBytes(9).toString("base64url");
  const { error } = await supabase.rpc("create_shared_plan", { p_id: id, p_data: parsed.data });
  if (error) {
    console.error("plan save failed", error.message);
    return Response.json({ id: null });
  }
  return Response.json({ id });
}
