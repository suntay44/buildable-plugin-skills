import { Pressable, Text, View } from "react-native";
import { currentStreak, frequencyLabels, isCompleted, lastNDates, weeklyCompletion } from "@/lib/habit-utils";
import type { Habit } from "@/types/habit";

type Props = {
  habit: Habit;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export function HabitCard({ habit, onToggle, onDelete }: Props) {
  const done = isCompleted(habit);
  const streak = currentStreak(habit);
  const week = lastNDates(7);

  return (
    <View className="rounded-2xl border border-slate-200 bg-white p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <View className="flex-row items-center gap-2">
            <View className="h-3 w-3 rounded-full" style={{ backgroundColor: habit.color }} />
            <Text className="text-base font-semibold text-ink">{habit.name}</Text>
          </View>
          <Text className="mt-1 text-xs text-slate-500">
            {frequencyLabels[habit.frequency]} · {streak} day streak · {weeklyCompletion(habit)}% this week
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={done ? `Mark ${habit.name} not done` : `Mark ${habit.name} done`}
          onPress={() => onToggle(habit.id)}
          className={`h-11 w-11 items-center justify-center rounded-full border ${done ? "border-meadow bg-meadow" : "border-slate-300 bg-white"}`}
        >
          <Text className={`text-lg font-bold ${done ? "text-white" : "text-slate-300"}`}>✓</Text>
        </Pressable>
      </View>

      <View className="mt-4 flex-row justify-between">
        {week.map((date) => {
          const hit = Boolean(habit.history[date]);
          const label = new Date(date).toLocaleDateString("en-US", { weekday: "narrow" });
          return (
            <View key={date} className="items-center gap-1">
              <View className={`h-7 w-7 rounded-md ${hit ? "bg-meadow" : "bg-mist"}`} />
              <Text className="text-[10px] text-slate-400">{label}</Text>
            </View>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Delete ${habit.name}`}
        onPress={() => onDelete(habit.id)}
        className="mt-3 self-start"
      >
        <Text className="text-xs font-semibold text-coral">Delete habit</Text>
      </Pressable>
    </View>
  );
}
