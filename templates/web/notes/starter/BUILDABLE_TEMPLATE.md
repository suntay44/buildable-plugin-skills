# Buildable Notes Template

This is the runnable golden starter for the `notes` archetype.

- Archetype: `notes`
- Target: web
- Stack: Next.js, TypeScript, Tailwind CSS, local state
- Primary screen: `app/page.tsx` (two-pane notes workspace)
- Entity: `Note` (`types/note.ts`)
- Derived logic: `lib/note-utils.ts` (filtering, sorting, tag counts, preview)
- Persistence seam: `lib/repository.ts` — notes survive a refresh via a localStorage repository behind the Buildable repository interface (`knowledge/data-layer/repository-pattern.md`); swap the factory to move up the persistence ladder without touching components
- Sample data: `lib/sample-notes.ts`

When adapting this starter, keep data local, preserve the empty and filtered-empty states, and do not add accounts, sync, or a hosted database unless the user explicitly requests them.
