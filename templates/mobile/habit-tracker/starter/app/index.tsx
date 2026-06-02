import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HabitCard } from "@/components/habit-card";
import { HabitComposer } from "@/components/habit-composer";
import { ProgressSummary } from "@/components/progress-summary";
import { isCompleted, toggleToday } from "@/lib/habit-utils";
import { sampleHabits } from "@/lib/sample-habits";
import type { Habit } from "@/types/habit";

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const [habits, setHabits] = useState<Habit[]>(sampleHabits);

  // Show habits still to do before completed ones.
  const sortedHabits = useMemo(
    () => [...habits].sort((a, b) => Number(isCompleted(a)) - Number(isCompleted(b))),
    [habits]
  );

  function createHabit(habit: Habit) {
    setHabits((current) => [...current, habit]);
  }

  function toggleHabit(id: string) {
    setHabits((current) => current.map((habit) => (habit.id === id ? toggleToday(habit) : habit)));
  }

  function deleteHabit(id: string) {
    setHabits((current) => current.filter((habit) => habit.id !== id));
  }

  return (
    <ScrollView
      className="flex-1 bg-[#f7f8fb]"
      contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32, gap: 12 }}
    >
      <ProgressSummary habits={habits} />

      <HabitComposer onCreate={createHabit} />

      {habits.length === 0 ? (
        <View className="items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8">
          <Text className="text-base font-semibold text-ink">No habits yet</Text>
          <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
            Add your first habit above. Check it off each day to build a streak and watch your weekly progress fill in.
          </Text>
        </View>
      ) : (
        sortedHabits.map((habit) => (
          <HabitCard key={habit.id} habit={habit} onToggle={toggleHabit} onDelete={deleteHabit} />
        ))
      )}
    </ScrollView>
  );
}
