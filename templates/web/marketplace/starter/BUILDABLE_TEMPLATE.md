# Buildable Marketplace Template

This is the runnable golden starter for the `marketplace` archetype.

- Archetype: `marketplace`
- Target: web
- Stack: Next.js, TypeScript, Tailwind CSS, local state
- Primary screen: `app/page.tsx` (browse + detail dialog)
- Entity: `Listing` (`types/marketplace.ts`)
- Derived logic: `lib/marketplace-utils.ts` (filtering, sorting, category counts)
- Sample data: `lib/sample-listings.ts`

When adapting this starter, keep data local, preserve the filtered-empty and inquiry-confirmation states, and do not add auth, billing, databases, telemetry, or deployment unless the user explicitly requests them.
