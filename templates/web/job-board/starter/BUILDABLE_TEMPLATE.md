# Buildable Job Board Template

This is the runnable golden starter for the `job-board` archetype.

- Archetype: `job-board`
- Target: web
- Stack: Next.js, TypeScript, Tailwind CSS, local state
- Primary screen: `app/page.tsx` (two-pane: filtered job list + detail with apply)
- Entities: `Job`, `Application` (`types/job.ts`)
- Derived logic: `lib/job-utils.ts` (filtering, search, newest-first)
- Sample data: `lib/sample-jobs.ts`

When adapting this starter, keep applications in local state, preserve the filtered-empty and apply-confirmation states, and do not add accounts, payments, or external job-board APIs unless the user explicitly requests them.
