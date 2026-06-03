# Buildable Booking Starter (Mobile)

A runnable, local-first appointment booking prototype (Expo + React Native + TypeScript + NativeWind, Expo Router, local state).

## Run

```bash
npm install
npm run start
```

Then press `i` (iOS simulator), `a` (Android), or `w` (web). Use the Expo Go app to run on a device.

## Checks

```bash
npm run typecheck
```

> Native build/run requires an Expo toolchain (simulator or device). This starter follows standard Expo Router + NativeWind v4 conventions; verify on a simulator after `npm install`.

## What's Included

- Four-step flow: choose service → pick a time → enter details → confirmation
- Progress header, Back/Continue navigation, and a sticky action bar
- Unavailable slots are disabled; required fields are validated
- Confirmation summary and "Book another" reset
- Meaningful sample services and availability

All data is local React state. No accounts, payments, calendar sync, or hosted services.
