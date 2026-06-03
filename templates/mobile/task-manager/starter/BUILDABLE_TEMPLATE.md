# Buildable Task Manager Template (Mobile)

This is the runnable golden starter for the `task-manager` archetype on mobile.

- Archetype: `task-manager`
- Target: mobile
- Stack: Expo, React Native, TypeScript, NativeWind, Expo Router, local state
- Primary screen: `app/index.tsx`
- Root layout: `app/_layout.tsx`
- Entity: `Task` (`types/task.ts`)
- Derived logic: `lib/task-utils.ts` (filtering, stats, status toggle)
- Sample data: `lib/sample-tasks.ts`

Styling uses NativeWind v4 wired through `babel.config.js`, `metro.config.js`, `tailwind.config.js`, and `global.css`. When adapting, keep data local, keep touch targets comfortable, preserve the empty and filtered-empty states, and do not add notifications, sync, or accounts unless explicitly requested.
