import { Pressable, Text, View } from "react-native";
import type { AvailabilitySlot } from "@/types/booking";

type Props = {
  slots: AvailabilitySlot[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function SlotPicker({ slots, selectedId, onSelect }: Props) {
  const byDay = slots.reduce<Record<string, AvailabilitySlot[]>>((groups, slot) => {
    (groups[slot.day] ??= []).push(slot);
    return groups;
  }, {});

  if (slots.length === 0) {
    return (
      <View className="rounded-2xl border border-dashed border-slate-300 bg-white p-6">
        <Text className="text-center text-sm text-slate-500">No times available for this service. Pick another service.</Text>
      </View>
    );
  }

  return (
    <View className="gap-4">
      <Text className="text-base font-semibold text-ink">Pick a time</Text>
      {Object.entries(byDay).map(([day, daySlots]) => (
        <View key={day} className="gap-2">
          <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">{day}</Text>
          <View className="flex-row flex-wrap gap-2">
            {daySlots.map((slot) => {
              const selected = slot.id === selectedId;
              const disabled = !slot.available;
              return (
                <Pressable
                  key={slot.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected, disabled }}
                  disabled={disabled}
                  onPress={() => onSelect(slot.id)}
                  className={`rounded-xl border px-4 py-2.5 ${
                    disabled
                      ? "border-slate-100 bg-slate-50"
                      : selected
                        ? "border-ocean bg-ocean"
                        : "border-slate-300 bg-white"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      disabled ? "text-slate-300 line-through" : selected ? "text-white" : "text-ink"
                    }`}
                  >
                    {slot.time}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}
