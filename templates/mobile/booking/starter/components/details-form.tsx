import { Text, TextInput, View } from "react-native";
import type { BookingDraft } from "@/types/booking";

type Props = {
  draft: BookingDraft;
  errors: { name?: string; email?: string };
  onChange: (changes: Partial<BookingDraft>) => void;
};

export function DetailsForm({ draft, errors, onChange }: Props) {
  return (
    <View className="gap-4">
      <Text className="text-base font-semibold text-ink">Enter your details</Text>
      <Text className="-mt-2 text-xs text-slate-500">Name and email are required fields.</Text>

      <View className="gap-1">
        <Text className="text-sm font-medium text-slate-700">Name</Text>
        <TextInput
          value={draft.customerName}
          onChangeText={(value) => onChange({ customerName: value })}
          placeholder="Full name"
          placeholderTextColor="#94a3b8"
          className="h-12 rounded-xl border border-slate-300 bg-white px-3 text-base text-ink"
        />
        {errors.name ? <Text className="text-sm text-coral">{errors.name}</Text> : null}
      </View>

      <View className="gap-1">
        <Text className="text-sm font-medium text-slate-700">Email</Text>
        <TextInput
          value={draft.customerEmail}
          onChangeText={(value) => onChange({ customerEmail: value })}
          placeholder="you@example.com"
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          keyboardType="email-address"
          className="h-12 rounded-xl border border-slate-300 bg-white px-3 text-base text-ink"
        />
        {errors.email ? <Text className="text-sm text-coral">{errors.email}</Text> : null}
      </View>

      <View className="gap-1">
        <Text className="text-sm font-medium text-slate-700">Notes (optional)</Text>
        <TextInput
          value={draft.notes}
          onChangeText={(value) => onChange({ notes: value })}
          placeholder="Anything we should know?"
          placeholderTextColor="#94a3b8"
          multiline
          className="min-h-[80px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-base text-ink"
        />
      </View>
    </View>
  );
}
