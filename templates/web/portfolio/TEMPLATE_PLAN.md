# Portfolio Template Plan

Runnable golden starter for the `portfolio` archetype: an editorial personal site with hero, filterable project grid, case study previews, about, and contact CTA.

## Structure

- `app/page.tsx` — hero → featured work → about → contact, single page with anchors
- `components/project-grid.tsx` — client component: tag filter, filtered-empty state, expandable case study preview
- `lib/sample-projects.ts` — profile + 6 realistic projects (mixed tags, some with case studies)
- `types/project.ts` — `Project`, `Profile`

## Acceptance Checklist

- hero states who and what within the first viewport
- tag filter narrows the grid and shows a filtered-empty state with a clear-filter action
- project summaries are concrete outcomes, not duty lists
- case study preview (problem / approach / outcome) expands without losing grid context
- contact CTA reachable from hero and footer
- responsive: 1-column mobile, 2-3 column desktop

## Non-Goals

- no contact-form backend, analytics, or CMS — content lives in `lib/sample-projects.ts`
