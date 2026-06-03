import { Text, View } from "react-native";
import { stepLabels, stepOrder } from "@/lib/booking-utils";
import type { BookingStep } from "@/types/booking";

export function StepHeader({ step }: { step: BookingStep }) {
  const activeIndex = stepOrder.indexOf(step);

  return (
    <View className="flex-row gap-2">
      {stepOrder.map((value, index) => {
        const done = index <= activeIndex;
        return (
          <View key={value} className="flex-1 gap-1">
            <View className={`h-1.5 rounded-full ${done ? "bg-ocean" : "bg-mist"}`} />
            <Text className={`text-xs ${done ? "font-semibold text-ocean" : "text-slate-400"}`}>{stepLabels[value]}</Text>
          </View>
        );
      })}
    </View>
  );
}
