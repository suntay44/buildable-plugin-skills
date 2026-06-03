import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { priorityColors, priorityLabels, statusLabels } from "@/lib/task-utils";
import type { Task } from "@/types/task";

type Props = {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
};

export function TaskCard({ task, onToggle, onEdit, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const done = task.status === "done";

  function save() {
    const trimmed = title.trim();
    if (!trimmed) return;
    onEdit({ ...task, title: trimmed });
    setEditing(false);
  }

  return (
    <View className="flex-row items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={done ? `Reopen ${task.title}` : `Complete ${task.title}`}
        onPress={() => onToggle(task.id)}
        className={`mt-0.5 h-7 w-7 items-center justify-center rounded-full border ${done ? "border-meadow bg-meadow" : "border-slate-300"}`}
      >
        <Text className={`text-base font-bold ${done ? "text-white" : "text-transparent"}`}>✓</Text>
      </Pressable>

      <View className="flex-1 gap-2">
        {editing ? (
          <TextInput
            value={title}
            onChangeText={setTitle}
            onSubmitEditing={save}
            autoFocus
            className="h-10 rounded-xl border border-slate-300 px-3 text-base text-ink"
          />
        ) : (
          <Text className={`text-base font-semibold ${done ? "text-slate-400 line-through" : "text-ink"}`}>{task.title}</Text>
        )}
        {task.notes && !editing ? <Text className="text-sm text-slate-500">{task.notes}</Text> : null}

        <View className="flex-row items-center gap-2">
          <View className="flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full" style={{ backgroundColor: priorityColors[task.priority] }} />
            <Text className="text-xs text-slate-500">{priorityLabels[task.priority]}</Text>
          </View>
          <Text className="text-xs text-slate-400">· {statusLabels[task.status]}</Text>
        </View>

        <View className="flex-row gap-3">
          {editing ? (
            <Pressable accessibilityRole="button" onPress={save}>
              <Text className="text-sm font-semibold text-ocean">Save</Text>
            </Pressable>
          ) : (
            <Pressable accessibilityRole="button" onPress={() => setEditing(true)}>
              <Text className="text-sm font-semibold text-ocean">Edit</Text>
            </Pressable>
          )}
          <Pressable accessibilityRole="button" onPress={() => onDelete(task.id)}>
            <Text className="text-sm font-semibold text-coral">Delete</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
