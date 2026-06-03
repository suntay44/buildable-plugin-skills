import type { AvailabilitySlot, BookingDraft, Service } from "@/types/booking";

export const stepOrder = ["service", "slot", "details", "confirmation"] as const;

export const stepLabels: Record<(typeof stepOrder)[number], string> = {
  service: "Service",
  slot: "Time",
  details: "Details",
  confirmation: "Done"
};

export function slotsForService(slots: AvailabilitySlot[], serviceId: string | null) {
  if (!serviceId) return [];
  return slots.filter((slot) => slot.serviceId === serviceId);
}

export function findService(services: Service[], id: string | null) {
  return services.find((service) => service.id === id) ?? null;
}

export function findSlot(slots: AvailabilitySlot[], id: string | null) {
  return slots.find((slot) => slot.id === id) ?? null;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validateDetails(draft: BookingDraft) {
  const errors: { name?: string; email?: string } = {};
  if (!draft.customerName.trim()) errors.name = "Enter your name.";
  if (!isValidEmail(draft.customerEmail)) errors.email = "Enter a valid email.";
  return errors;
}

export function createBookingId() {
  return `booking-${Date.now().toString(36)}`;
}
