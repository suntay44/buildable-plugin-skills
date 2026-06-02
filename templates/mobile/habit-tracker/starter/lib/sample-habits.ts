import { lastNDates } from "@/lib/habit-utils";
import type { Habit } from "@/types/habit";

function history(pattern: boolean[]): Record<string, boolean> {
  const dates = lastNDates(pattern.length);
  const record: Record<string, boolean> = {};
  dates.forEach((date, index) => {
    if (pattern[index]) record[date] = true;
  });
  return record;
}

export const sampleHabits: Habit[] = [
  {
    id: "habit-1",
    name: "Morning workout",
    frequency: "daily",
    targetDays: [],
    color: "#2f8f6f",
    createdAt: "2026-05-01",
    history: history([true, true, true, false, true, true, true])
  },
  {
    id: "habit-2",
    name: "Read 20 minutes",
    frequency: "daily",
    targetDays: [],
    color: "#2563eb",
    createdAt: "2026-05-03",
    history: history([true, false, true, true, true, true, false])
  },
  {
    id: "habit-3",
    name: "No phone after 10pm",
    frequency: "daily",
    targetDays: [],
    color: "#c98a24",
    createdAt: "2026-05-10",
    history: history([false, true, true, true, false, false, false])
  },
  {
    id: "habit-4",
    name: "Inbox to zero",
    frequency: "weekdays",
    targetDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    color: "#d95f43",
    createdAt: "2026-05-12",
    history: history([true, true, false, true, true, true, true])
  }
];
