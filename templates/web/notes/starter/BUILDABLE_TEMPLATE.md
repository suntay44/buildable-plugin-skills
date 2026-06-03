# Buildable Notes Template

This is the runnable golden starter for the `notes` archetype.

- Archetype: `notes`
- Target: web
- Stack: Next.js, TypeScript, Tailwind CSS, local state
- Primary screen: `app/page.tsx` (two-pane notes workspace)
- Entity: `Note` (`types/note.ts`)
- Derived logic: `lib/note-utils.ts` (filtering, sorting, tag counts, preview)
- Sample data: `lib/sample-notes.ts`

When adapting this starter, keep data local, preserve the empty and filtered-empty states, and do not add accounts, sync, or a hosted database unless the user explicitly requests them.
