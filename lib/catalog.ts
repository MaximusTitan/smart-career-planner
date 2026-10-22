import type { Career, Fit, Profile, Stage } from "./types";
import { profileTags } from "./options";

type Entry = Omit<Career, "whyFit" | "fit" | "roadmap"> & {
  tags: string[];
  /** [subjects, try it, mission] for Grade 4, 5, 6, 7+ */
  road: [string, string, string][];
};

const GRADES = ["Grade 4", "Grade 5", "Grade 6", "Grade 7+"];

const CATALOG: Entry[] = [
  {
    id: "game-maker", emoji: "🎮", title: "Game Maker",
    tagline: "Make video games people love",
    tags: ["games", "computers", "art", "puzzles", "ideas", "math"],
    day: ["Dream up a game idea", "Draw the characters", "Test it and have fun"],
    skills: ["Creative", "Puzzles", "Teamwork"], pay: 4, demand: 4,
    studyNow: ["Maths", "Computers", "Art"], studyLater: ["Computer science", "Game design", "Maths"],
    road: [
      ["Maths and Art", "Try Scratch, draw a game", "Design your game"],
      ["Maths and Computers", "Join a coding club", "Build a mini game"],
      ["Science and Computers", "Make a game with friends", "Share it at school"],
      ["Computer science", "Learn Python", "Code a big game"],
    ],
  },
  {
    id: "scientist", emoji: "🔬", title: "Scientist",
    tagline: "Discover how the world works",
    tags: ["science", "math", "puzzles", "ideas", "outdoors", "reading"],
    day: ["Ask a big question", "Run experiments", "Share what you found"],
    skills: ["Curious", "Careful", "Patient"], pay: 3, demand: 4,
    studyNow: ["Science", "Maths", "Reading"], studyLater: ["Biology, chemistry or physics", "Research skills", "Maths"],
    road: [
      ["Science and Reading", "Grow a bean in a jar", "Write down what you see"],
      ["Science and Maths", "Do a kitchen experiment", "Make a science poster"],
      ["Science and Computers", "Join the science club", "Show an experiment to class"],
      ["Biology, chemistry, physics", "Enter a science fair", "Plan your own project"],
    ],
  },
  {
    id: "animal-doctor", emoji: "🐾", title: "Animal Doctor",
    tagline: "Help pets and wild animals feel better",
    tags: ["animals", "science", "people", "outdoors"],
    day: ["Check on sick animals", "Give medicine and care", "Talk to pet owners"],
    skills: ["Kind", "Gentle", "Science-minded"], pay: 3, demand: 3,
    studyNow: ["Science", "Reading", "Maths"], studyLater: ["Biology", "Chemistry", "Veterinary school"],
    road: [
      ["Science and Reading", "Read about animals", "Draw an animal's body"],
      ["Science and Maths", "Help care for a pet", "Make a pet care poster"],
      ["Biology basics", "Visit a vet or zoo", "Ask a vet your questions"],
      ["Biology and Chemistry", "Volunteer at a shelter", "Plan how to become a vet"],
    ],
  },
  {
    id: "animator", emoji: "🎬", title: "Animator",
    tagline: "Bring drawings to life in movies",
    tags: ["art", "computers", "stories", "ideas", "games"],
    day: ["Sketch characters", "Make them move", "Add sound and colour"],
    skills: ["Artistic", "Patient", "Storyteller"], pay: 3, demand: 3,
    studyNow: ["Art", "Computers", "Reading"], studyLater: ["Animation course", "Drawing skills", "Computer graphics"],
    road: [
      ["Art and Reading", "Make a flip book", "Draw a 6-picture story"],
      ["Art and Computers", "Try a free animation app", "Animate a bouncing ball"],
      ["Art and Stories", "Make a short cartoon", "Show it to your class"],
      ["Art and Computer skills", "Learn a pro animation tool", "Make a 30-second film"],
    ],
  },
  {
    id: "robot-builder", emoji: "🤖", title: "Robot Builder",
    tagline: "Build machines that move and think",
    tags: ["build", "computers", "science", "math", "puzzles", "ideas"],
    day: ["Design a robot", "Build and wire it", "Program it to move"],
    skills: ["Problem solver", "Hands-on", "Logical"], pay: 4, demand: 4,
    studyNow: ["Maths", "Science", "Computers"], studyLater: ["Engineering", "Coding", "Electronics"],
    road: [
      ["Maths and Science", "Build with blocks or LEGO", "Make a machine that moves"],
      ["Science and Computers", "Try block coding", "Program a character to move"],
      ["Maths and Computers", "Join a robotics club", "Build a simple robot"],
      ["Engineering and Coding", "Learn Python or Arduino", "Build a robot that solves a problem"],
    ],
  },
  {
    id: "musician", emoji: "🎸", title: "Musician",
    tagline: "Make music that makes people feel things",
    tags: ["music", "talking", "ideas", "people", "art"],
    day: ["Practise your instrument", "Write new songs", "Play for an audience"],
    skills: ["Creative", "Dedicated", "Brave"], pay: 2, demand: 3,
    studyNow: ["Music", "Maths", "Reading"], studyLater: ["Music lessons", "Music theory", "Sound recording"],
    road: [
      ["Music and Maths", "Learn 3 simple songs", "Practise 10 minutes a day"],
      ["Music and Reading", "Write a short song", "Play for your family"],
      ["Music and Talking", "Join the school band or choir", "Perform at school"],
      ["Music theory", "Record your own song", "Play at a school show"],
    ],
  },
  {
    id: "doctor", emoji: "🩺", title: "Doctor",
    tagline: "Help people get well and stay healthy",
    tags: ["science", "people", "talking", "puzzles", "reading"],
    day: ["Talk with patients", "Work out what is wrong", "Help them feel better"],
    skills: ["Caring", "Calm", "Good listener"], pay: 4, demand: 4,
    studyNow: ["Science", "Reading", "Maths"], studyLater: ["Biology", "Chemistry", "Medical school"],
    road: [
      ["Science and Reading", "Learn how the body works", "Draw the heart or lungs"],
      ["Science and Maths", "Learn basic first aid", "Teach someone a health tip"],
      ["Science and Talking", "Ask a doctor about their job", "Make a healthy habits poster"],
      ["Biology and Chemistry", "Join a health club", "Plan your path to medical school"],
    ],
  },
  {
    id: "teacher", emoji: "🍎", title: "Teacher",
    tagline: "Help kids learn amazing things",
    tags: ["people", "talking", "reading", "stories", "ideas"],
    day: ["Plan fun lessons", "Explain new ideas", "Help every kid learn"],
    skills: ["Patient", "Clear speaker", "Kind"], pay: 3, demand: 4,
    studyNow: ["Reading", "Talking", "Maths"], studyLater: ["A subject you love", "Teacher training", "Communication"],
    road: [
      ["Reading and Talking", "Explain a game to a friend", "Teach a younger kid something"],
      ["Reading and Maths", "Help a classmate", "Make a mini lesson"],
      ["Talking and Art", "Lead a group activity", "Teach a lesson to your class"],
      ["Your favourite subject", "Tutor younger kids", "Plan a whole lesson"],
    ],
  },
  {
    id: "architect", emoji: "🏗️", title: "Architect",
    tagline: "Design buildings and places people love",
    tags: ["build", "art", "math", "ideas", "puzzles"],
    day: ["Draw building plans", "Build small models", "Visit building sites"],
    skills: ["Creative", "Good with shapes", "Careful"], pay: 4, demand: 3,
    studyNow: ["Maths", "Art", "Science"], studyLater: ["Architecture degree", "Drawing skills", "Maths"],
    road: [
      ["Art and Maths", "Draw your dream house", "Build it from cardboard"],
      ["Maths and Art", "Build a model with blocks", "Add rooms and a garden"],
      ["Maths and Science", "Design a playground", "Show your plan to the class"],
      ["Maths and Design", "Try a free 3D design tool", "Design a whole building"],
    ],
  },
  {
    id: "sports-coach", emoji: "🏅", title: "Sports Coach",
    tagline: "Help teams play, win and have fun",
    tags: ["sports", "people", "talking", "outdoors"],
    day: ["Plan practice drills", "Cheer players on", "Teach new skills"],
    skills: ["Energetic", "Encouraging", "Team leader"], pay: 3, demand: 3,
    studyNow: ["Sports", "Science", "Talking"], studyLater: ["Sports science", "Coaching course", "First aid"],
    road: [
      ["Sports and Science", "Learn a new sport", "Invent a fun game"],
      ["Sports and Talking", "Help a friend improve", "Lead a warm-up"],
      ["Sports and Maths", "Keep score for a team", "Run a mini practice"],
      ["Sports science", "Help coach younger kids", "Plan a training week"],
    ],
  },
  {
    id: "author", emoji: "📚", title: "Author",
    tagline: "Write stories and books people love",
    tags: ["reading", "stories", "ideas", "art"],
    day: ["Invent characters", "Write chapters", "Fix and polish your story"],
    skills: ["Imaginative", "Curious", "Persistent"], pay: 2, demand: 3,
    studyNow: ["Reading", "Art", "Talking"], studyLater: ["English and writing", "Creative writing", "Reading a lot"],
    road: [
      ["Reading and Art", "Write a 1-page story", "Draw its main character"],
      ["Reading and Talking", "Keep a story journal", "Read your story aloud"],
      ["Writing", "Write a short chapter book", "Share it with friends"],
      ["Creative writing", "Join a writing club", "Finish a short book"],
    ],
  },
  {
    id: "park-ranger", emoji: "🌳", title: "Park Ranger",
    tagline: "Protect nature and wild animals",
    tags: ["outdoors", "animals", "science", "sports", "people"],
    day: ["Walk through the park", "Look after wildlife", "Teach visitors about nature"],
    skills: ["Outdoorsy", "Observant", "Caring"], pay: 2, demand: 3,
    studyNow: ["Science", "Sports", "Reading"], studyLater: ["Environmental science", "Biology", "First aid"],
    road: [
      ["Science and Reading", "Spot 5 plants or birds", "Make a nature journal"],
      ["Science and Art", "Plant something", "Make a poster about a local animal"],
      ["Science and Sports", "Go on a nature walk", "Tell your class about it"],
      ["Environmental science", "Join a clean-up or nature club", "Plan a school garden"],
    ],
  },
];

const TAG_WORDS: Record<string, string> = {
  math: "maths", science: "science", art: "art", reading: "reading", stories: "stories",
  sports: "sports", computers: "computers", games: "games", build: "building", animals: "animals",
  music: "music", people: "helping people", puzzles: "puzzles", ideas: "new ideas",
  talking: "talking", outdoors: "being outside",
};

function joinWords(words: string[]) {
  if (words.length <= 1) return words.join("");
  return `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}

function toCareer(e: Entry, fit: Fit, matched: string[]): Career {
  const { tags: _tags, road, ...rest } = e;
  void _tags;
  const roadmap: Stage[] = road.map(([subjects, tryIt, mission], i) => ({
    grade: GRADES[i], subjects, tryIt, mission,
  }));
  const likes = joinWords(matched.slice(0, 3).map((t) => TAG_WORDS[t] ?? t));
  return {
    ...rest,
    fit,
    whyFit: likes
      ? `You love ${likes}, and ${e.title.toLowerCase()}s use those every day!`
      : `${e.title}s do something new every day.`,
    roadmap,
  };
}

/** A stable, answer-dependent order for careers that score the same, so no one career always wins ties. */
function tieBreak(id: string, tags: string[]) {
  let h = 0;
  for (const ch of id + tags.join(",")) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return h;
}

/** Offline fallback: score careers by shared interests. Used when no AI key is set. */
export function matchCareers(profile: Profile, count = 8): Career[] {
  const tags = profileTags(profile);
  const scored = CATALOG.map((e) => {
    const score = tags.filter((t) => e.tags.includes(t)).length;
    const matched = [...new Set(tags.filter((t) => e.tags.includes(t)))];
    return { e, score, matched };
  }).sort((a, b) => b.score - a.score || tieBreak(a.e.id, tags) - tieBreak(b.e.id, tags));
  const top = scored[0]?.score || 1;
  return scored.slice(0, count).map(({ e, score, matched }) => {
    const ratio = score / top;
    const fit: Fit = ratio >= 0.8 ? "great" : ratio >= 0.5 ? "good" : "maybe";
    return toCareer(e, fit, matched);
  });
}

const ALIASES: Record<string, string> = {
  vet: "animal-doctor", veterinar: "animal-doctor", "game": "game-maker", "robot": "robot-builder",
  scien: "scientist", cartoon: "animator", singer: "musician", music: "musician", guitar: "musician",
  coach: "sports-coach", writer: "author", book: "author", ranger: "park-ranger", engineer: "robot-builder",
};

export function findCatalogCareer(text: string): Career | undefined {
  const lower = text.toLowerCase();
  const alias = Object.keys(ALIASES).find((k) => lower.includes(k));
  const e =
    CATALOG.find((c) => lower.includes(c.title.toLowerCase()) || lower.includes(c.id.replace("-", " "))) ??
    CATALOG.find((c) => c.id === (alias && ALIASES[alias]));
  return e ? toCareer(e, "good", e.tags.slice(0, 3)) : undefined;
}
