# Recipe App Template Plan

Runnable golden starter for the `recipe-app` archetype: browse recipe cards with ingredient search and category/diet filters, open a detail view with ingredients and ordered steps, and save recipes locally.

## Structure

- `app/page.tsx` — client workspace: search + filters + card grid + detail pane + saved-only toggle
- `components/recipe-card.tsx` — photo-free card: name, total time, servings, tags, save toggle
- `components/recipe-detail.tsx` — ingredients with quantities, numbered steps, save CTA
- `lib/recipe-utils.ts` — filtering, ingredient search, total time
- `lib/sample-recipes.ts` — 8 realistic recipes across categories with diet tags
- `types/recipe.ts` — `Recipe`, `Ingredient`, `RecipeFilters`

## Acceptance Checklist

- cards read well without photos (name, time, servings, tags lead)
- search matches ingredient names, not just titles
- category and diet filters combine with search; result count visible
- filtered-empty state with a clear-filters action
- saved-only view has its own empty state
- detail steps are numbered and scannable; servings shown with ingredients
- responsive: grid stacks cleanly on mobile, detail pane stacks below the list

## Non-Goals

- no accounts, sync, grocery integrations, or hosted services — `saved` is a local toggle
