# Buildable Booking Template (Mobile)

This is the runnable golden starter for the `booking` archetype on mobile.

- Archetype: `booking`
- Target: mobile
- Stack: Expo, React Native, TypeScript, NativeWind, Expo Router, local state
- Primary screen: `app/index.tsx` (stepped booking flow)
- Root layout: `app/_layout.tsx` (Expo Router stack)
- Entities: `Service`, `AvailabilitySlot`, `Booking` (`types/booking.ts`)
- Derived logic: `lib/booking-utils.ts` (slot filtering, validation, step order)
- Sample data: `lib/sample-services.ts`

Styling uses NativeWind v4 wired through `babel.config.js`, `metro.config.js`, `tailwind.config.js`, and `global.css`. When adapting, keep data local, keep touch targets comfortable, preserve the validation and confirmation states, and do not add payments, accounts, calendar sync, or notifications unless explicitly requested.
