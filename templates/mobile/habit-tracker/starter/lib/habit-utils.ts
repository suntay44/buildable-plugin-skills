import type { Habit, HabitFrequency } from "@/types/habit";

export const today = "2026-06-01";

export const frequencyLabels: Record<HabitFrequency, string> = {
  daily: "Every day",
  weekdays: "Weekdays",
  custom: "Custom days"
};

export function lastNDates(count: number, end: string = today): string[] {
  const dates: string[] = [];
  const endTime = new Date(end).getTime();
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    dates.push(new Date(endTime - offset * 86_400_000).toISOString().slice(0, 10));
  }
  return dates;
}

export function isCompleted(habit: Habit, date: string = today): boolean {
  return Boolean(habit.history[date]);
}

export function currentStreak(habit: Habit, end: string = today): number {
  let streak = 0;
  let cursor = new Date(end).getTime();
  while (habit.history[new Date(cursor).toISOString().slice(0, 10)]) {
    streak += 1;
    cursor -= 86_400_000;
  }
  return streak;
}

export function weeklyCompletion(habit: Habit): number {
  const week = lastNDates(7);
  const done = week.filter((date) => habit.history[date]).length;
  return Math.round((done / week.length) * 100);
}

export function toggleToday(habit: Habit, date: string = today): Habit {
  const history = { ...habit.history };
  if (history[date]) {
    delete history[date];
  } else {
    history[date] = true;
  }
  return { ...habit, history };
}

export function summary(habits: Habit[]) {
  const completedToday = habits.filter((habit) => isCompleted(habit)).length;
  return {
    total: habits.length,
    completedToday,
    remaining: habits.length - completedToday,
    percent: habits.length === 0 ? 0 : Math.round((completedToday / habits.length) * 100)
  };
}

export function createHabitId(): string {
  return `habit-${Date.now().toString(36)}`;
}
