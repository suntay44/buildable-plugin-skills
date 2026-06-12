# Portfolio Screen Graph

```txt
home
  -> hero (name, tagline, contact CTA)
  -> featured work (project grid)
  -> about (bio + skills)
  -> contact (email CTA + social links)
work
  -> project grid (tag filter)
  -> case study preview (problem / approach / outcome)
```

## Required States

- populated project grid
- tag-filtered grid + filtered-empty state ("No projects match this tag")
- project with and without a case study
- responsive grid: 1 column mobile, 2-3 desktop

## Notes

- Hero communicates who and what within the first viewport.
- Contact CTA repeats in the hero and the footer.
- Case study preview can expand inline or on a detail surface; keep grid context reachable.
