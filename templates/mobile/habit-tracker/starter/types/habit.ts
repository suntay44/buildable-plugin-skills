export type HabitFrequency = "daily" | "weekdays" | "custom";

export type Habit = {
  id: string;
  name: string;
  frequency: HabitFrequency;
  targetDays: string[];
  color: string;
  createdAt: string;
  history: Record<string, boolean>;
};
