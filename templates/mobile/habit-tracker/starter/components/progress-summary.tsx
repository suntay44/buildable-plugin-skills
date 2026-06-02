import { Text, View } from "react-native";
import { summary } from "@/lib/habit-utils";
import type { Habit } from "@/types/habit";

export function ProgressSummary({ habits }: { habits: Habit[] }) {
  const stats = summary(habits);

  return (
    <View className="rounded-2xl bg-ink p-5">
      <Text className="text-sm font-medium text-white/70">Today&apos;s progress</Text>
      <Text className="mt-1 text-3xl font-bold text-white">
        {stats.completedToday}/{stats.total} done
      </Text>
      <View className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/20">
        <View className="h-full rounded-full bg-meadow" style={{ width: `${stats.percent}%` }} />
      </View>
      <Text className="mt-2 text-sm text-white/70">
        {stats.remaining === 0 ? "All habits complete — nice streak!" : `${stats.remaining} habit${stats.remaining === 1 ? "" : "s"} left today`}
      </Text>
    </View>
  );
}
