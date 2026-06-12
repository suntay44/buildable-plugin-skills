# Blog/CMS Template Plan

Runnable golden starter for the `blog-cms` archetype: a two-pane content workspace — post list with status/category filters and search on the left, post editor on the right.

## Structure

- `app/page.tsx` — client workspace wiring list + editor state (create, edit, publish, delete)
- `components/post-list.tsx` — search, status filter, category filter, post rows with status chips
- `components/post-editor.tsx` — title, slug, excerpt, body, author, category, tags, status, publish/unpublish, delete
- `lib/sample-posts.ts` — 8 realistic posts across drafts/scheduled/published
- `lib/post-utils.ts` — filtering, search, slugify, date formatting
- `types/post.ts` — `Post`, `PostStatus`

## Acceptance Checklist

- list distinguishes draft / scheduled / published with non-color-only chips
- search + status filter + category filter combine
- editor round-trips all metadata; publish stamps `publishedAt`
- empty state (no posts) and filtered-empty state both exist
- delete confirms before removing
- responsive: panes stack on mobile without overflow

## Non-Goals

- no hosted CMS, accounts, comments backend, or publishing integrations — content is local state seeded from `lib/sample-posts.ts`
