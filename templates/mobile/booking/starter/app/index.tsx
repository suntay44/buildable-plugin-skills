import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Confirmation } from "@/components/confirmation";
import { DetailsForm } from "@/components/details-form";
import { ServicePicker } from "@/components/service-picker";
import { SlotPicker } from "@/components/slot-picker";
import { StepHeader } from "@/components/step-header";
import { findService, findSlot, slotsForService, validateDetails } from "@/lib/booking-utils";
import { sampleServices, sampleSlots } from "@/lib/sample-services";
import type { BookingDraft, BookingStep } from "@/types/booking";

const emptyDraft: BookingDraft = {
  serviceId: null,
  slotId: null,
  customerName: "",
  customerEmail: "",
  notes: ""
};

/**
 * Booking flow, one step at a time:
 *   1. select service
 *   2. select slot (unavailable times are disabled)
 *   3. enter details and validate required fields
 *   4. show confirmation
 */
export default function BookingScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<BookingStep>("service");
  const [draft, setDraft] = useState<BookingDraft>(emptyDraft);
  const [showErrors, setShowErrors] = useState(false);

  const serviceSlots = useMemo(() => slotsForService(sampleSlots, draft.serviceId), [draft.serviceId]);
  const service = findService(sampleServices, draft.serviceId);
  const slot = findSlot(sampleSlots, draft.slotId);
  const errors = validateDetails(draft);

  function update(changes: Partial<BookingDraft>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  function selectService(serviceId: string) {
    update({ serviceId, slotId: null });
  }

  function next() {
    if (step === "service" && draft.serviceId) setStep("slot");
    else if (step === "slot" && draft.slotId) setStep("details");
    else if (step === "details") {
      if (Object.keys(errors).length > 0) {
        setShowErrors(true);
        return;
      }
      setShowErrors(false);
      setStep("confirmation");
    }
  }

  function back() {
    if (step === "slot") setStep("service");
    else if (step === "details") setStep("slot");
    else if (step === "confirmation") setStep("details");
  }

  function reset() {
    setDraft(emptyDraft);
    setShowErrors(false);
    setStep("service");
  }

  const canContinue =
    (step === "service" && Boolean(draft.serviceId)) ||
    (step === "slot" && Boolean(draft.slotId)) ||
    step === "details";

  return (
    <View className="flex-1 bg-[#f7f8fb]">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 20 }}>
        <StepHeader step={step} />

        {step === "service" ? (
          <ServicePicker services={sampleServices} selectedId={draft.serviceId} onSelect={selectService} />
        ) : null}

        {step === "slot" ? <SlotPicker slots={serviceSlots} selectedId={draft.slotId} onSelect={(slotId) => update({ slotId })} /> : null}

        {step === "details" ? <DetailsForm draft={draft} errors={showErrors ? errors : {}} onChange={update} /> : null}

        {step === "confirmation" ? <Confirmation service={service} slot={slot} draft={draft} /> : null}
      </ScrollView>

      <View className="flex-row gap-3 border-t border-slate-200 bg-white px-4 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
        {step === "confirmation" ? (
          <Pressable accessibilityRole="button" onPress={reset} className="flex-1 items-center rounded-xl bg-ink py-3.5">
            <Text className="text-base font-semibold text-white">Book another</Text>
          </Pressable>
        ) : (
          <>
            {step !== "service" ? (
              <Pressable accessibilityRole="button" onPress={back} className="items-center rounded-xl border border-slate-300 px-5 py-3.5">
                <Text className="text-base font-semibold text-slate-700">Back</Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !canContinue }}
              onPress={next}
              className={`flex-1 items-center rounded-xl py-3.5 ${canContinue ? "bg-ocean" : "bg-slate-300"}`}
            >
              <Text className="text-base font-semibold text-white">{step === "details" ? "Confirm booking" : "Continue"}</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}
