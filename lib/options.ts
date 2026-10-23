import type { Profile } from "./types";

export type Option = { label: string; emoji: string; tags: string[] };

export const SUBJECTS: Option[] = [
  { label: "Maths", emoji: "➗", tags: ["math"] },
  { label: "Science", emoji: "🔬", tags: ["science"] },
  { label: "Art", emoji: "🎨", tags: ["art"] },
  { label: "Photography", emoji: "📷", tags: ["photography", "art"] },
  { label: "Reading", emoji: "📖", tags: ["reading", "stories"] },
  { label: "Sports", emoji: "⚽", tags: ["sports"] },
  { label: "Computers", emoji: "💻", tags: ["computers"] },
];

/** Words a student might type for "Other", mapped to the interest tags the matcher knows. */
const OTHER_KEYWORDS: [RegExp, string[]][] = [
  [/math|number|algebra/, ["math"]],
  [/scien|chemi|physic|biolog|space|astronom/, ["science"]],
  [/\bart|draw|paint|design|craft/, ["art"]],
  [/photo|camera|film|video/, ["photography", "art"]],
  [/read|english|writ|story|stories|book|poet/, ["reading", "stories"]],
  [/sport|pe\b|football|cricket|soccer|swim|run|gym|dance/, ["sports"]],
  [/comput|cod|program|tech|robot/, ["computers"]],
  [/game|gaming/, ["games"]],
  [/music|sing|guitar|piano|drum/, ["music"]],
  [/animal|pet|nature|garden|plant/, ["animals", "outdoors"]],
  [/drama|theat|speak|debate|language/, ["talking", "stories"]],
];

export function otherTags(text: string | undefined): string[] {
  const t = (text ?? "").toLowerCase();
  return t ? OTHER_KEYWORDS.flatMap(([re, tags]) => (re.test(t) ? tags : [])) : [];
}

export const LOVES: Option[] = [
  { label: "Draw", emoji: "✏️", tags: ["art"] },
  { label: "Take photos", emoji: "📸", tags: ["photography", "art"] },
  { label: "Play games", emoji: "🎮", tags: ["games"] },
  { label: "Build", emoji: "🧱", tags: ["build"] },
  { label: "Care for pets", emoji: "🐶", tags: ["animals"] },
  { label: "Make music", emoji: "🎵", tags: ["music"] },
  { label: "Help others", emoji: "🤝", tags: ["people"] },
];

export const GOOD_AT: Option[] = [
  { label: "Puzzles", emoji: "🧩", tags: ["puzzles"] },
  { label: "New ideas", emoji: "💡", tags: ["ideas"] },
  { label: "Talking", emoji: "🗣️", tags: ["talking", "people"] },
  { label: "Photography", emoji: "📷", tags: ["photography", "art"] },
];

export const GRADES = [4, 5, 6, 7, 8, 9, 10, 11, 12];

export type QuizQuestion = {
  question: string;
  options: Option[];
  /** Adds a "Something else" choice; the prompt and placeholder guide what to type. */
  allowOther?: { prompt: string; placeholder: string };
};

/** The quiz answer saved when a student chooses "Other" and types their own. */
export const OTHER_LABEL = "Other";

/** The words a student gave for question i: the option label, or what they typed for "Other". */
export function quizAnswerText(p: Profile, i: number): string {
  const label = p.quiz[i];
  if (!label) return "";
  return label === OTHER_LABEL ? (p.quizOther?.[i] ?? "").trim() : label;
}

export const QUIZ: QuizQuestion[] = [
  {
    question: "What sounds like the best Saturday?",
    allowOther: {
      prompt: "Tell Ollie your best Saturday!",
      placeholder: "Like bake a cake, go cycling, watch films…",
    },
    options: [
      {
        label: "Make a game or app",
        emoji: "🎮",
        tags: ["games", "computers"],
      },
      { label: "Paint or draw", emoji: "🎨", tags: ["art"] },
      { label: "Play with animals", emoji: "🐾", tags: ["animals"] },
      { label: "Build with blocks or tools", emoji: "🧱", tags: ["build"] },
    ],
  },
  {
    question: "What would you love to do most?",
    allowOther: {
      prompt: "Tell Ollie what you would love to do!",
      placeholder: "Like write songs, fly drones, grow plants…",
    },
    options: [
      { label: "Build things", emoji: "🔧", tags: ["build", "science"] },
      { label: "Draw and make art", emoji: "🎨", tags: ["art", "ideas"] },
      { label: "Help animals", emoji: "🐾", tags: ["animals", "people"] },
      { label: "Try experiments", emoji: "🔬", tags: ["science", "puzzles"] },
    ],
  },
  {
    question: "How do you like to work?",
    allowOther: {
      prompt: "Tell Ollie how you like to work!",
      placeholder: "Like with music on, in a lab, with my pets…",
    },
    options: [
      {
        label: "Alone, solving puzzles",
        emoji: "🧩",
        tags: ["puzzles", "math"],
      },
      { label: "In a team", emoji: "👫", tags: ["people"] },
      {
        label: "Outside in nature",
        emoji: "🌳",
        tags: ["outdoors", "science"],
      },
      { label: "In front of people", emoji: "🎤", tags: ["talking", "music"] },
    ],
  },
  {
    question: "Which school thing is the most fun?",
    allowOther: {
      prompt: "Tell Ollie your favourite school thing!",
      placeholder: "Like drama, cooking class, school trips…",
    },
    options: [
      { label: "Number puzzles", emoji: "➗", tags: ["math", "puzzles"] },
      { label: "Stories and books", emoji: "📚", tags: ["reading", "stories"] },
      { label: "Science experiments", emoji: "🧪", tags: ["science"] },
      { label: "Sports and PE", emoji: "⚽", tags: ["sports", "outdoors"] },
    ],
  },
  {
    question: "Pick a superpower!",
    options: [
      { label: "Fix anything broken", emoji: "🛠️", tags: ["build", "ideas"] },
      { label: "Talk to animals", emoji: "🦜", tags: ["animals"] },
      {
        label: "Make anything I imagine real",
        emoji: "✨",
        tags: ["art", "ideas", "stories"],
      },
      {
        label: "Help anyone feel better",
        emoji: "💛",
        tags: ["people", "science"],
      },
    ],
  },
];

function tagsFor(options: Option[], labels: string[]) {
  return labels.flatMap((l) => options.find((o) => o.label === l)?.tags ?? []);
}

/** Every interest tag the student showed, with repeats so strong interests count more. */
export function profileTags(p: Profile): string[] {
  const quiz = QUIZ.flatMap((q, i) => {
    const pick = q.options.find((o) => o.label === p.quiz[i]);
    const tags = pick ? pick.tags : p.quiz[i] === OTHER_LABEL ? otherTags(quizAnswerText(p, i)) : [];
    return [...tags, ...tags]; // quiz picks count double
  });
  return [
    ...tagsFor(SUBJECTS, p.subjects),
    ...otherTags(p.otherSubject),
    ...otherTags(p.otherLove),
    ...otherTags(p.otherGoodAt),
    ...tagsFor(LOVES, p.loves),
    ...tagsFor(GOOD_AT, p.goodAt),
    ...quiz,
  ];
}

/** Human labels the AI can read. */
export function profileLabels(p: Profile): string[] {
  return [
    ...p.subjects,
    ...(p.otherSubject?.trim() ? [p.otherSubject.trim()] : []),
    ...p.loves,
    ...(p.otherLove?.trim() ? [p.otherLove.trim()] : []),
    ...p.goodAt,
    ...(p.otherGoodAt?.trim() ? [p.otherGoodAt.trim()] : []),
    ...QUIZ.flatMap((_, i) => (quizAnswerText(p, i) ? [quizAnswerText(p, i)] : [])),
  ];
}

/** A fingerprint of everything that shapes the job matches (not the name). */
export function profileKey(p: Profile): string {
  const sorted = (l: string[]) => [...l].sort();
  return JSON.stringify([
    p.grade,
    sorted(p.subjects),
    (p.otherSubject ?? "").trim().toLowerCase(),
    sorted(p.loves),
    (p.otherLove ?? "").trim().toLowerCase(),
    sorted(p.goodAt),
    (p.otherGoodAt ?? "").trim().toLowerCase(),
    QUIZ.map((_, i) => quizAnswerText(p, i)),
    p.extra.trim(),
  ]);
}

export const EMPTY_PROFILE: Profile = {
  name: "",
  grade: null,
  subjects: [],
  loves: [],
  goodAt: [],
  quiz: {},
  extra: "",
  otherSubject: "",
  otherLove: "",
  otherGoodAt: "",
};
