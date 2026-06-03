import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { priorityLabels, statusLabels } from "@/lib/task-utils";
import type { TaskFilters, TaskPriority, TaskStatus } from "@/types/task";

type Props = {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
};

const statuses: ("all" | TaskStatus)[] = ["all", "todo", "in-progress", "done"];
const priorities: ("all" | TaskPriority)[] = ["all", "low", "medium", "high"];

export function TaskFilterBar({ filters, onChange }: Props) {
  return (
    <View className="gap-3">
      <TextInput
        value={filters.query}
        onChangeText={(query) => onChange({ ...filters, query })}
        placeholder="Search tasks"
        placeholderTextColor="#94a3b8"
        className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-base text-ink"
      />
      <View className="gap-2">
        <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">Filter by status</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {statuses.map((status) => (
            <Chip
              key={status}
              label={status === "all" ? "All" : statusLabels[status]}
              active={filters.status === status}
              onPress={() => onChange({ ...filters, status })}
            />
          ))}
        </ScrollView>
      </View>
      <View className="gap-2">
        <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">Filter by priority</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {priorities.map((priority) => (
            <Chip
              key={priority}
              label={priority === "all" ? "All" : priorityLabels[priority]}
              active={filters.priority === priority}
              onPress={() => onChange({ ...filters, priority })}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={`rounded-full border px-3 py-1.5 ${active ? "border-ocean bg-ocean" : "border-slate-300 bg-white"}`}
    >
      <Text className={`text-sm font-medium ${active ? "text-white" : "text-slate-600"}`}>{label}</Text>
    </Pressable>
  );
}
