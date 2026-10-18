import type { Career, Profile } from "./types";
import { profileLabels } from "./options";

/** Plain "provider/model" strings route through the Vercel AI Gateway. */
export const MODEL = process.env.AI_MODEL || "anthropic/claude-haiku-5-5";

export function aiConfigured() {
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
}

/** Safety rules shared by every prompt: the users are children aged about 9 to 12. */
export const KID_RULES = `You are Ollie the owl, a friendly career helper for children in Grades 4 to 6 (ages 9 to 12).
- Use short sentences and simple words a 9-year-old understands. Be warm and encouraging.
- Only talk about careers, school subjects, hobbies and how to explore them. If asked about anything else, kindly steer back to careers.
- Never mention salary numbers, exams that rank kids, or say a child "can't" do something. Every career is an idea to explore.
- Never ask for or repeat personal details like surnames, addresses, schools or phone numbers.
- Never claim certainty: say "you might like", not "you should be".
- Keep it safe, kind and age-appropriate.`;

export function profileSummary(p: Profile) {
  const parts = [
    p.name && `Name: ${p.name.slice(0, 30)}`,
    p.grade && `Grade: ${p.grade}`,
    `Interests: ${profileLabels(p).join(", ") || "not shared yet"}`,
    p.extra && `Also loves: ${p.extra.slice(0, 200)}`,
  ].filter(Boolean);
  return parts.join("\n");
}

export function careerTitles(careers: Career[]) {
  return careers.map((c) => c.title).join(", ");
}
