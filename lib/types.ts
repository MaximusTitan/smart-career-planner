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
  /** A school subject the student typed themselves (the "Other" choice). */
  otherSubject?: string;
  /** Something to do the student typed themselves (the "Other" choice under "I love to"). */
  otherLove?: string;
  /** Something the student is good at that they typed themselves (the "Other" choice under "I'm good at"). */
  otherGoodAt?: string;
  /** Custom quiz answers typed under "Other", by question number. */
  quizOther?: Record<number, string>;
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
  /** Fingerprint of the answers the careers were picked for, so stale jobs can be flagged. */
  careersFor?: string;
  source: "ai" | "offline" | null;
};
