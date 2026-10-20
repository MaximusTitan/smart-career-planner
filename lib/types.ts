export type Fit = "great" | "good" | "maybe";

export type Stage = {
  grade: string;
  subjects: string;
  tryIt: string;
  mission: string;
};

export type Career = {
  id: string;
  title: string;
  emoji: string;
  tagline: string;
  whyFit: string;
  fit: Fit;
  day: string[];
  skills: string[];
  pay: number;
  demand: number;
  studyNow: string[];
  studyLater: string[];
  roadmap: Stage[];
};

export type Profile = {
  name: string;
  grade: number | null;
  subjects: string[];
  loves: string[];
  goodAt: string[];
  quiz: Record<number, string>;
  extra: string;
};

export type ChatMessage = { role: "user" | "assistant"; content: string };

/** Everything one person's account remembers. Saved to Supabase. */
export type SavedState = {
  profile: Profile;
  careers: Career[];
  selectedId: string | null;
  compareIds: string[];
  savedIds: string[];
  doneMissions: string[];
  source: "ai" | "offline" | null;
};
