# Buildable CRM Template

This is the runnable golden starter for the `crm` archetype.

- Archetype: `crm`
- Target: web
- Stack: Next.js, TypeScript, Tailwind CSS, local state
- Primary screen: `app/page.tsx` (pipeline workspace)
- Entity: `Lead` (`types/crm.ts`)
- Derived logic: `lib/crm-utils.ts` (stage totals, stale detection, filtering)
- Sample data: `lib/sample-leads.ts`

When adapting this starter, keep data local, preserve the empty and filtered-empty states, and do not add auth, billing, databases, telemetry, or deployment unless the user explicitly requests them.
