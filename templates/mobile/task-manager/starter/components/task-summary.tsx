import { Text, View } from "react-native";
import { taskStats } from "@/lib/task-utils";
import type { Task } from "@/types/task";

export function TaskSummary({ tasks }: { tasks: Task[] }) {
  const stats = taskStats(tasks);
  const items = [
    ["Total", stats.total],
    ["Active", stats.active],
    ["Done", stats.done]
  ] as const;

  return (
    <View className="flex-row gap-3">
      {items.map(([label, value]) => (
        <View key={label} className="flex-1 rounded-2xl border border-slate-200 bg-white p-3">
          <Text className="text-xs text-slate-500">{label}</Text>
          <Text className="mt-1 text-2xl font-semibold text-ink">{value}</Text>
        </View>
      ))}
    </View>
  );
}
