import { Text, View } from "react-native";
import type { AvailabilitySlot, BookingDraft, Service } from "@/types/booking";

type Props = {
  service: Service | null;
  slot: AvailabilitySlot | null;
  draft: BookingDraft;
};

export function Confirmation({ service, slot, draft }: Props) {
  const rows = [
    ["Service", service ? service.name : "—"],
    ["When", slot ? `${slot.day} · ${slot.time}` : "—"],
    ["Duration", service ? `${service.durationMinutes} min` : "—"],
    ["Price", service ? service.priceLabel : "—"],
    ["Name", draft.customerName],
    ["Email", draft.customerEmail]
  ];

  return (
    <View className="gap-4">
      <View className="items-center gap-2 rounded-2xl bg-emerald-50 p-5">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-meadow">
          <Text className="text-xl font-bold text-white">✓</Text>
        </View>
        <Text className="text-lg font-semibold text-ink">Booking confirmed</Text>
        <Text className="text-center text-sm text-slate-600">
          This is a local prototype, so nothing was actually scheduled or emailed.
        </Text>
      </View>

      <View className="gap-2 rounded-2xl border border-slate-200 bg-white p-4">
        {rows.map(([label, value]) => (
          <View key={label} className="flex-row justify-between">
            <Text className="text-sm text-slate-500">{label}</Text>
            <Text className="max-w-[60%] text-right text-sm font-medium text-ink">{value || "—"}</Text>
          </View>
        ))}
        {draft.notes ? <Text className="mt-1 text-sm text-slate-500">Notes: {draft.notes}</Text> : null}
      </View>
    </View>
  );
}
