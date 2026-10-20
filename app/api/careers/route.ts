import { isSignedIn, unauthorized } from "@/lib/api-auth";
import { generateText, Output } from "ai";
import { z } from "zod";
import { aiConfigured, KID_RULES, MODEL, profileSummary } from "@/lib/ai";
import { matchCareers } from "@/lib/catalog";
import type { Career, Profile } from "@/lib/types";

const profileSchema = z.object({
  name: z.string().max(30),
  grade: z.number().int().min(1).max(12).nullable(),
  subjects: z.array(z.string().max(40)).max(12),
  loves: z.array(z.string().max(40)).max(12),
  goodAt: z.array(z.string().max(40)).max(12),
  quiz: z.record(z.string(), z.string().max(60)),
  extra: z.string().max(300),
});

// Step 1 (fast): which careers fit, with the short text shown on the Jobs screen.
const listSchema = z.object({
  careers: z
    .array(
      z.object({
        id: z.string().describe("short kebab-case id, e.g. game-maker"),
        title: z.string().describe("job name a child knows, e.g. Game Maker"),
        emoji: z.string().describe("one emoji"),
        tagline: z.string().describe("one short line, max 8 words"),
        whyFit: z.string().describe("one sentence starting with 'You love', linking this child's interests to the job"),
        fit: z.enum(["great", "good", "maybe"]),
      }),
    )
    .min(5)
    .max(8),
});

// Step 2 (one small call per career, run in parallel): everything on the detail and map screens.
const detailSchema = z.object({
  day: z.array(z.string()).length(3).describe("3 short things you do in a day"),
  skills: z.array(z.string()).length(3).describe("3 one-or-two-word skills"),
  pay: z.number().int().min(1).max(4).describe("1-4 how well it usually pays; shown as icons"),
  demand: z.number().int().min(1).max(4).describe("1-4 how much the job is needed; shown as icons"),
  studyNow: z.array(z.string()).length(3).describe("school subjects to enjoy now"),
  studyLater: z.array(z.string()).length(3).describe("what to study when older"),
  roadmap: z
    .array(
      z.object({
        grade: z.enum(["Grade 4", "Grade 5", "Grade 6", "Grade 7+"]),
        subjects: z.string().describe("subjects to focus on, e.g. Maths and Art"),
        tryIt: z.string().describe("one fun thing to try, max 8 words"),
        mission: z.string().describe("a small mission, max 6 words"),
      }),
    )
    .length(4),
});

async function generateCareers(profile: Profile): Promise<Career[]> {
  const summary = profileSummary(profile);

  const { output: list } = await generateText({
    model: MODEL,
    output: Output.object({ schema: listSchema }),
    system: KID_RULES,
    prompt: `Suggest 6 careers that match this child's interests, best match first.
Mix well-known jobs with a surprising one. Never more than 8. Write in simple words for a 9-year-old.

${summary}`,
  });

  const settled = await Promise.allSettled(
    list.careers.map(async (c): Promise<Career> => {
      const { output } = await generateText({
        model: MODEL,
        output: Output.object({ schema: detailSchema }),
        system: KID_RULES,
        prompt: `Write the details for the career "${c.title}" for this child. Use simple words a 9-year-old understands.
The four roadmap stages are Grade 4, Grade 5, Grade 6 and Grade 7+, each with a fun thing to try and a small mission.

${summary}`,
      });
      return { ...c, ...output };
    }),
  );

  const careers = settled.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
  if (careers.length < 3) throw new Error("Too few careers were generated");
  return careers;
}

export async function POST(request: Request) {
  if (!(await isSignedIn(request))) return unauthorized();
  const parsed = profileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const profile = parsed.data as unknown as Profile;

  if (aiConfigured()) {
    try {
      return Response.json({ careers: await generateCareers(profile), source: "ai" });
    } catch (error) {
      console.error("AI career match failed, using offline matches", error);
    }
  }

  return Response.json({ careers: matchCareers(profile), source: "offline" });
}
