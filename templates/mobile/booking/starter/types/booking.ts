export type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  priceLabel: string;
  description: string;
};

export type AvailabilitySlot = {
  id: string;
  serviceId: string;
  day: string;
  time: string;
  available: boolean;
};

export type Booking = {
  id: string;
  serviceId: string;
  slotId: string;
  customerName: string;
  customerEmail: string;
  notes: string;
};

export type BookingStep = "service" | "slot" | "details" | "confirmation";

export type BookingDraft = {
  serviceId: string | null;
  slotId: string | null;
  customerName: string;
  customerEmail: string;
  notes: string;
};
