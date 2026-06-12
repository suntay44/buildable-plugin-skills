# Recipe App Screen Graph

```txt
recipe list
  -> search (name + ingredient)
  -> category / diet filter chips
  -> recipe cards (image-free OK: name, time, servings, tags)
  -> save/unsave toggle
recipe detail
  -> ingredients (quantities, servings)
  -> steps (ordered, scannable)
  -> save CTA + back to list
```

## Required States

- populated card grid
- filtered-empty state ("No recipes match — clear filters")
- saved-only view with its own empty state
- detail view for a recipe with many steps (scroll comfort)

## Notes

- Filters and search stay visible together with a result count.
- Cards must work without photos: lead with name, time, and tags.
- Steps are numbered and readable at arm's length (cooking context).
