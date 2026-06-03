# Web Notes Golden Template Plan

## Product Shape

One polished two-pane notes workspace: a searchable/filterable note list beside a live editor.

## Proposed File Structure

```txt
app/
  layout.tsx
  page.tsx
components/
  note-list.tsx
  note-editor.tsx
  note-sidebar.tsx
lib/
  sample-notes.ts
  note-utils.ts
types/
  note.ts
```

## Required Features

- create note
- edit note (title + body) with live list updates
- delete note
- pin/unpin note
- search by title, body, or tag
- filter by collection and tag
- show empty and filtered-empty states

## Sample Data

Include 6 to 10 notes across two or three collections with varied tags, pinned and unpinned, and recent updated dates.

## Validation Hints

- Editing a note updates its list preview and last-updated ordering.
- Search and tag/collection filters combine correctly.
- The two-pane layout collapses to a single column on mobile.
