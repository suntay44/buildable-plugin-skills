# Buildable Habit Tracker Template (Mobile)

This is the runnable golden starter for the `habit-tracker` archetype on mobile.

- Archetype: `habit-tracker`
- Target: mobile
- Stack: Expo, React Native, TypeScript, NativeWind, Expo Router, local state
- Primary screen: `app/index.tsx` (Today)
- Root layout: `app/_layout.tsx` (Expo Router stack)
- Entity: `Habit` with a `history` check-in map (`types/habit.ts`)
- Derived logic: `lib/habit-utils.ts` (streaks, weekly completion, today summary)
- Sample data: `lib/sample-habits.ts`

Styling uses NativeWind v4 (`className` on RN components) wired through `babel.config.js`, `metro.config.js`, `tailwind.config.js`, and `global.css`. When adapting, keep data local, keep touch targets comfortable, preserve the empty state, and do not add accounts, push notifications, or persistence unless explicitly requested.
