import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { createHabitId, today } from "@/lib/habit-utils";
import type { Habit, HabitFrequency } from "@/types/habit";

type Props = {
  onCreate: (habit: Habit) => void;
};

const colors = ["#2f8f6f", "#2563eb", "#c98a24", "#d95f43"];
const frequencies: HabitFrequency[] = ["daily", "weekdays", "custom"];

export function HabitComposer({ onCreate }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");
  const [color, setColor] = useState(colors[0]);
  const [error, setError] = useState("");

  function submit() {
    if (!name.trim()) {
      setError("Name the habit before adding it.");
      return;
    }
    onCreate({
      id: createHabitId(),
      name: name.trim(),
      frequency,
      targetDays: frequency === "weekdays" ? ["Mon", "Tue", "Wed", "Thu", "Fri"] : [],
      color,
      createdAt: today,
      history: {}
    });
    setName("");
    setFrequency("daily");
    setColor(colors[0]);
    setError("");
    setOpen(false);
  }

  if (!open) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        className="items-center rounded-2xl border border-dashed border-slate-300 bg-white py-4"
      >
        <Text className="text-base font-semibold text-ocean">+ Add habit</Text>
      </Pressable>
    );
  }

  return (
    <View className="rounded-2xl border border-slate-200 bg-white p-4">
      <Text className="text-sm font-semibold text-ink">New habit</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g. Drink water"
        placeholderTextColor="#94a3b8"
        className="mt-3 h-12 rounded-xl border border-slate-300 px-3 text-base text-ink"
      />

      <Text className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">Frequency</Text>
      <View className="mt-2 flex-row gap-2">
        {frequencies.map((value) => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityState={{ selected: frequency === value }}
            onPress={() => setFrequency(value)}
            className={`rounded-full border px-3 py-2 ${frequency === value ? "border-ocean bg-ocean" : "border-slate-300 bg-white"}`}
          >
            <Text className={`text-sm font-medium ${frequency === value ? "text-white" : "text-slate-700"}`}>{value}</Text>
          </Pressable>
        ))}
      </View>

      <Text className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">Color</Text>
      <View className="mt-2 flex-row gap-3">
        {colors.map((value) => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityLabel={`Choose color ${value}`}
            onPress={() => setColor(value)}
            className={`h-9 w-9 items-center justify-center rounded-full ${color === value ? "border-2 border-ink" : ""}`}
            style={{ backgroundColor: value }}
          />
        ))}
      </View>

      {error ? <Text className="mt-3 text-sm font-medium text-coral">{error}</Text> : null}

      <View className="mt-4 flex-row gap-2">
        <Pressable accessibilityRole="button" onPress={submit} className="flex-1 items-center rounded-xl bg-meadow py-3">
          <Text className="text-base font-semibold text-white">Add habit</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => setOpen(false)} className="items-center rounded-xl border border-slate-300 px-4 py-3">
          <Text className="text-base font-semibold text-slate-700">Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}
