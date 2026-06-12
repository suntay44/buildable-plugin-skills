# Buildable Portfolio Template

This is the runnable golden starter for the `portfolio` archetype.

- Archetype: `portfolio`
- Target: web
- Stack: Next.js, TypeScript, Tailwind CSS, local content data
- Primary screen: `app/page.tsx` (hero → selected work → about → contact CTA)
- Entities: `Project`, `Profile` (`types/project.ts`)
- Filterable grid with case-study previews: `components/project-grid.tsx`
- Content as data: `lib/sample-projects.ts`

When adapting this starter, replace the sample profile/projects with the user's real work, keep summaries outcome-focused, preserve the tag filter and filtered-empty state, and do not add a contact-form backend, analytics, or CMS unless the user explicitly requests them.
