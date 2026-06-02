# Buildable Dashboard Template

This is the runnable golden starter for the `dashboard` archetype.

- Archetype: `dashboard`
- Target: web
- Stack: Next.js, TypeScript, Tailwind CSS, local mock data
- Primary screen: `app/page.tsx` (analytics overview)
- Entities: `Metric`, `TimeSeriesPoint`, `EventRow` (`types/dashboard.ts`)
- Derived logic: `lib/dashboard-utils.ts` (range slicing, summaries, status counts)
- Sample data: `lib/sample-data.ts`

The trend chart is a dependency-free inline SVG so the starter has no chart library. When adapting, keep data local, preserve the empty states, and do not add auth, billing, databases, telemetry, or deployment unless explicitly requested.
