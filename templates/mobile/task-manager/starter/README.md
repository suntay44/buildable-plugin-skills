# Buildable Task Manager Starter (Mobile)

A runnable, local-first task manager prototype (Expo + React Native + TypeScript + NativeWind, Expo Router, local state).

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

- Quick task creation with a priority selector
- Tap to complete/reopen, inline edit, and delete
- Search and filter by status and priority
- Summary counts and an empty / filtered-empty state
- Meaningful sample tasks

All data is local React state. No accounts, notifications, sync, or hosted services.
