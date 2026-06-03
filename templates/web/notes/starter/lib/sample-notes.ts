import type { Note } from "@/types/note";

export const sampleNotes: Note[] = [
  {
    id: "note-1",
    title: "Q3 product bets",
    body: "Three themes for next quarter: faster onboarding, a sharable workspace, and offline-first sync.\n\nNeed to size each before planning.",
    tags: ["product", "planning"],
    collection: "Work",
    pinned: true,
    createdAt: "2026-05-20",
    updatedAt: "2026-05-31"
  },
  {
    id: "note-2",
    title: "Reading list",
    body: "- Thinking in Systems\n- The Art of Doing Science and Engineering\n- A City Is Not a Tree (essay)",
    tags: ["reading"],
    collection: "Personal",
    pinned: false,
    createdAt: "2026-05-18",
    updatedAt: "2026-05-28"
  },
  {
    id: "note-3",
    title: "Standup notes",
    body: "Shipped the filter bar. Blocked on the empty-state copy. Pairing with Sam after lunch on the editor.",
    tags: ["standup", "work"],
    collection: "Work",
    pinned: false,
    createdAt: "2026-05-30",
    updatedAt: "2026-05-30"
  },
  {
    id: "note-4",
    title: "Trip planning — Lisbon",
    body: "Flights flexible the second week. Stay in Alfama. Day trip to Sintra. Try the seafood place near the market.",
    tags: ["travel", "personal"],
    collection: "Personal",
    pinned: true,
    createdAt: "2026-05-10",
    updatedAt: "2026-05-27"
  },
  {
    id: "note-5",
    title: "Interview debrief",
    body: "Strong on systems design, light on testing discipline. Recommend a follow-up focused on code quality.",
    tags: ["hiring", "work"],
    collection: "Work",
    pinned: false,
    createdAt: "2026-05-22",
    updatedAt: "2026-05-25"
  },
  {
    id: "note-6",
    title: "Garden",
    body: "Tomatoes need staking. Start basil indoors. Compost turned this weekend.",
    tags: ["home"],
    collection: "Personal",
    pinned: false,
    createdAt: "2026-05-12",
    updatedAt: "2026-05-21"
  },
  {
    id: "note-7",
    title: "Architecture decision: local-first",
    body: "Keep all prototype data in memory by default. Persistence is opt-in and only when the user asks. No hosted database for V1.",
    tags: ["product", "decision"],
    collection: "Work",
    pinned: false,
    createdAt: "2026-05-08",
    updatedAt: "2026-05-19"
  }
];
