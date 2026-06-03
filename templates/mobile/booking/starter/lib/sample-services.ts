import type { AvailabilitySlot, Service } from "@/types/booking";

export const sampleServices: Service[] = [
  { id: "svc-1", name: "Haircut & style", durationMinutes: 45, priceLabel: "$48", description: "Wash, cut, and finish with a quick style." },
  { id: "svc-2", name: "Beard trim", durationMinutes: 20, priceLabel: "$22", description: "Shape-up and line detailing." },
  { id: "svc-3", name: "Color & gloss", durationMinutes: 90, priceLabel: "$120", description: "Full color with a shine-boosting gloss." },
  { id: "svc-4", name: "Kids cut", durationMinutes: 30, priceLabel: "$30", description: "Patient, friendly cut for little ones." }
];

function slotsFor(serviceId: string, times: { day: string; time: string; available?: boolean }[]): AvailabilitySlot[] {
  return times.map((slot, index) => ({
    id: `${serviceId}-slot-${index}`,
    serviceId,
    day: slot.day,
    time: slot.time,
    available: slot.available ?? true
  }));
}

export const sampleSlots: AvailabilitySlot[] = [
  ...slotsFor("svc-1", [
    { day: "Mon Jun 1", time: "9:00 AM" },
    { day: "Mon Jun 1", time: "11:30 AM", available: false },
    { day: "Mon Jun 1", time: "2:00 PM" },
    { day: "Tue Jun 2", time: "10:00 AM" },
    { day: "Tue Jun 2", time: "4:30 PM" }
  ]),
  ...slotsFor("svc-2", [
    { day: "Mon Jun 1", time: "9:30 AM" },
    { day: "Mon Jun 1", time: "1:00 PM" },
    { day: "Tue Jun 2", time: "3:00 PM", available: false },
    { day: "Wed Jun 3", time: "11:00 AM" }
  ]),
  ...slotsFor("svc-3", [
    { day: "Tue Jun 2", time: "9:00 AM" },
    { day: "Wed Jun 3", time: "1:30 PM" },
    { day: "Thu Jun 4", time: "10:00 AM" }
  ]),
  ...slotsFor("svc-4", [
    { day: "Mon Jun 1", time: "3:30 PM" },
    { day: "Wed Jun 3", time: "9:00 AM" },
    { day: "Sat Jun 6", time: "10:30 AM" }
  ])
];
