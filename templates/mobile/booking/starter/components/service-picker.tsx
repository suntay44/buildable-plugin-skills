import { Pressable, Text, View } from "react-native";
import type { Service } from "@/types/booking";

type Props = {
  services: Service[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function ServicePicker({ services, selectedId, onSelect }: Props) {
  return (
    <View className="gap-3">
      <Text className="text-base font-semibold text-ink">Choose a service</Text>
      {services.map((service) => {
        const selected = service.id === selectedId;
        return (
          <Pressable
            key={service.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onSelect(service.id)}
            className={`rounded-2xl border p-4 ${selected ? "border-ocean bg-blue-50" : "border-slate-200 bg-white"}`}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-ink">{service.name}</Text>
              <Text className="text-base font-semibold text-ocean">{service.priceLabel}</Text>
            </View>
            <Text className="mt-1 text-sm text-slate-500">
              {service.durationMinutes} min · {service.description}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
