# Buildable Habit Tracker Starter (Mobile)

A runnable, local-first habit tracker prototype (Expo + React Native + TypeScript + NativeWind, Expo Router, local state).

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

- Today screen with a progress summary ring/bar
- Create habit (name, frequency, color), check off today, delete habit
- Current streak, weekly completion %, and a 7-day grid per habit
- Touch-friendly targets and an empty state
- Meaningful sample habits with history

All data is local React state. No accounts, notifications, persistence, or hosted services.
