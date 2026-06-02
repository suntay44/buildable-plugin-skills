# Booking Data Model

## Entities

```ts
type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  priceLabel: string;
  description: string;
};

type AvailabilitySlot = {
  id: string;
  serviceId: string;
  startsAt: string;
  available: boolean;
};

type Booking = {
  id: string;
  serviceId: string;
  slotId: string;
  customerName: string;
  customerEmail: string;
  notes: string;
};
```

## Derived Values

- available slots by service
- selected booking summary
- confirmation state

