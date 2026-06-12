# Buildable Recipe App Template

This is the runnable golden starter for the `recipe-app` archetype.

- Archetype: `recipe-app`
- Target: web
- Stack: Next.js, TypeScript, Tailwind CSS, local state
- Primary screen: `app/page.tsx` (filters + card grid + detail pane + saved view)
- Entity: `Recipe` (`types/recipe.ts`)
- Derived logic: `lib/recipe-utils.ts` (ingredient search, filters, total time)
- Sample data: `lib/sample-recipes.ts` (8 recipes across categories with diet tags)

When adapting this starter, keep recipes local, preserve the filtered-empty and saved-empty states, keep ingredient search matching ingredient names, and do not add accounts, sync, grocery integrations, or hosted services unless the user explicitly requests them.
