# Mobile Booking Golden Template Plan

## Product Shape

A mobile appointment flow from service selection to local confirmation.

## Proposed File Structure

```txt
app/
  _layout.tsx
  index.tsx
  confirmation.tsx
components/
  service-card.tsx
  slot-picker.tsx
  booking-form.tsx
  booking-summary.tsx
lib/
  sample-booking.ts
  booking-utils.ts
types/
  booking.ts
```

## Required Features

- service selection
- date/time slot selection
- customer details form
- validation for required details
- confirmation state
- empty state when no slots are available

## Validation Hints

- The selected service and time remain visible before confirmation.
- Required fields are labeled.
- No payments, calendar sync, accounts, or notifications unless requested.

