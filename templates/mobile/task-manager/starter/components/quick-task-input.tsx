import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { createTaskId, priorityLabels, today } from "@/lib/task-utils";
import type { Task, TaskPriority } from "@/types/task";

const priorities: TaskPriority[] = ["low", "medium", "high"];

export function QuickTaskInput({ onCreate }: { onCreate: (task: Task) => void }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");

  function create() {
    const trimmed = title.trim();
    if (!trimmed) return;
    onCreate({
      id: createTaskId(),
      title: trimmed,
      notes: "",
      status: "todo",
      priority,
      createdAt: today()
    });
    setTitle("");
    setPriority("medium");
  }

  return (
    <View className="gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <View className="flex-row gap-2">
        <TextInput
          value={title}
          onChangeText={setTitle}
          onSubmitEditing={create}
          placeholder="Add a task…"
          placeholderTextColor="#94a3b8"
          returnKeyType="done"
          className="h-11 flex-1 rounded-xl border border-slate-300 px-3 text-base text-ink"
        />
        <Pressable accessibilityRole="button" accessibilityLabel="Create task" onPress={create} className="h-11 items-center justify-center rounded-xl bg-ocean px-4">
          <Text className="text-base font-semibold text-white">Add</Text>
        </Pressable>
      </View>
      <View className="flex-row gap-2">
        {priorities.map((value) => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityState={{ selected: priority === value }}
            onPress={() => setPriority(value)}
            className={`rounded-full border px-3 py-1.5 ${priority === value ? "border-ocean bg-ocean" : "border-slate-300 bg-white"}`}
          >
            <Text className={`text-xs font-medium ${priority === value ? "text-white" : "text-slate-600"}`}>{priorityLabels[value]}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
