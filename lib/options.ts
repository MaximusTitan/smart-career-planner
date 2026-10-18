import type { Profile } from "./types";

export type Option = { label: string; emoji: string; tags: string[] };

export const SUBJECTS: Option[] = [
  { label: "Maths", emoji: "➗", tags: ["math"] },
  { label: "Science", emoji: "🔬", tags: ["science"] },
  { label: "Art", emoji: "🎨", tags: ["art"] },
  { label: "Reading", emoji: "📖", tags: ["reading", "stories"] },
  { label: "Sports", emoji: "⚽", tags: ["sports"] },
  { label: "Computers", emoji: "💻", tags: ["computers"] },
];

export const LOVES: Option[] = [
  { label: "Draw", emoji: "✏️", tags: ["art"] },
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
];

export const GRADES = [4, 5, 6];

export type QuizQuestion = { question: string; options: Option[] };

export const QUIZ: QuizQuestion[] = [
  {
    question: "What sounds like the best Saturday?",
    options: [
      { label: "Make a game or app", emoji: "🎮", tags: ["games", "computers"] },
      { label: "Paint or draw", emoji: "🎨", tags: ["art"] },
      { label: "Play with animals", emoji: "🐾", tags: ["animals"] },
      { label: "Build with blocks or tools", emoji: "🧱", tags: ["build"] },
    ],
  },
  {
    question: "What would you love to do most?",
    options: [
      { label: "Build things", emoji: "🔧", tags: ["build", "science"] },
      { label: "Draw and make art", emoji: "🎨", tags: ["art", "ideas"] },
      { label: "Help animals", emoji: "🐾", tags: ["animals", "people"] },
      { label: "Try experiments", emoji: "🔬", tags: ["science", "puzzles"] },
    ],
  },
  {
    question: "How do you like to work?",
    options: [
      { label: "Alone, solving puzzles", emoji: "🧩", tags: ["puzzles", "math"] },
      { label: "In a team", emoji: "👫", tags: ["people"] },
      { label: "Outside in nature", emoji: "🌳", tags: ["outdoors", "science"] },
      { label: "In front of people", emoji: "🎤", tags: ["talking", "music"] },
    ],
  },
  {
    question: "Which school thing is the most fun?",
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
      { label: "Make anything I imagine real", emoji: "✨", tags: ["art", "ideas", "stories"] },
      { label: "Help anyone feel better", emoji: "💛", tags: ["people", "science"] },
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
    return pick ? [...pick.tags, ...pick.tags] : []; // quiz picks count double
  });
  return [
    ...tagsFor(SUBJECTS, p.subjects),
    ...tagsFor(LOVES, p.loves),
    ...tagsFor(GOOD_AT, p.goodAt),
    ...quiz,
  ];
}

/** Human labels the AI can read. */
export function profileLabels(p: Profile): string[] {
  return [
    ...p.subjects,
    ...p.loves,
    ...p.goodAt,
    ...QUIZ.flatMap((q, i) => (p.quiz[i] ? [p.quiz[i]] : [])),
  ];
}

export const EMPTY_PROFILE: Profile = {
  name: "",
  grade: null,
  subjects: [],
  loves: [],
  goodAt: [],
  quiz: {},
  extra: "",
};
