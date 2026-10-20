import { isSignedIn, unauthorized } from "@/lib/api-auth";
import { streamText } from "ai";
import { z } from "zod";
import { aiConfigured, KID_RULES, MODEL, profileSummary } from "@/lib/ai";
import { findCatalogCareer } from "@/lib/catalog";
import { EMPTY_PROFILE } from "@/lib/options";
import type { Profile } from "@/lib/types";

const bodySchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(600) }))
    .min(1)
    .max(40),
  profile: z.any().optional(),
  careers: z.array(z.string().max(60)).max(10).optional(),
});

function offlineReply(question: string, careers: string[]) {
  const career = findCatalogCareer(question);
  if (career) {
    return `${career.emoji} ${career.title}s ${career.tagline.toLowerCase()}! In a day they might ${career.day
      .map((d) => d.toLowerCase())
      .join(", ")}. To get ready, enjoy ${career.studyNow.join(", ")} at school. Want to know more?`;
  }
  const idea = careers[0];
  return `Hoo-hoo! I'm not sure yet, so let's explore together. What do you like doing when you have free time?${
    idea ? ` Or ask me about ${idea}!` : ""
  } 🦉`;
}

export async function POST(request: Request) {
  if (!(await isSignedIn(request))) return unauthorized();
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return new Response("Bad request", { status: 400 });
  }
  const { messages, careers = [] } = parsed.data;
  const profile: Profile = { ...EMPTY_PROFILE, ...(parsed.data.profile ?? {}) };

  if (!aiConfigured()) {
    const last = messages[messages.length - 1].content;
    return new Response(offlineReply(last, careers), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const result = streamText({
    model: MODEL,
    system: `${KID_RULES}
- Keep answers under 90 words. If the child says they don't know what they like, ask ONE easy question to help them think.

What we know about this child:
${profileSummary(profile)}
Careers already suggested: ${careers.join(", ") || "none yet"}`,
    messages: messages.slice(-12),
    maxOutputTokens: 300,
  });

  return result.toTextStreamResponse();
}
