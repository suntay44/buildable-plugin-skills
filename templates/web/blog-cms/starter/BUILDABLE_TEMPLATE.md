# Buildable Blog/CMS Template

This is the runnable golden starter for the `blog-cms` archetype.

- Archetype: `blog-cms`
- Target: web
- Stack: Next.js, TypeScript, Tailwind CSS, local state
- Primary screen: `app/page.tsx` (two-pane: post list + post editor)
- Entity: `Post` (`types/post.ts`)
- Derived logic: `lib/post-utils.ts` (filtering, search, slugify, status counts)
- Sample data: `lib/sample-posts.ts` (drafts, scheduled, published)

When adapting this starter, keep content local, preserve the empty and filtered-empty states and the draft/scheduled/published distinction, and do not add a hosted CMS, accounts, comments backend, or publishing integrations unless the user explicitly requests them.
