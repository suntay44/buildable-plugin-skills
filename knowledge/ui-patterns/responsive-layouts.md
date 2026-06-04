# Responsive Layouts

Concrete rules for layouts that never overflow or overlap. `buildable review` flags violations of the grid rule below as a `responsive-layout` warning.

## Grid track rule (most important)

A bare `1fr` track is `minmax(auto, 1fr)`. The `auto` minimum refuses to shrink below the column's content min-content, so a wide table or long string blows the column out and overlaps its neighbor.

- **Always pair a fixed track with `minmax(0, 1fr)`, never a bare `1fr`.**
  - ✅ `lg:grid-cols-[320px_minmax(0,1fr)]`
  - ❌ `lg:grid-cols-[320px_1fr]`
  - ✅ `lg:grid-cols-[minmax(0,1fr)_280px]`
  - ❌ `lg:grid-cols-[1fr_280px]`
- **Add `min-w-0` to any grid/flex child that contains a table, long text, or another grid.** Flex/grid children default to `min-width: auto` and will refuse to shrink otherwise.
- **Tables get `overflow-x-auto`** on a wrapper so they scroll instead of pushing the layout wide.
- **Card titles / cells with long text get `min-w-0` plus `truncate` or `line-clamp-*`.**

## Container vs viewport breakpoints

Tailwind's `sm:` / `md:` / `lg:` key off the **viewport**, not the element's container. A multi-column bar that fits a full-width page will **not** fit the same widths inside a narrow sidebar.

- **Content that lives in a fixed-width sidebar must stack there.** A filter bar placed in a ~340px sidebar should be `grid gap-3 sm:grid-cols-2 lg:grid-cols-1` (one column once the sidebar layout kicks in), not `md:grid-cols-[1fr_160px_160px]`.
- If you need true container-aware layout, use CSS container queries (`@container`) rather than viewport breakpoints.
- Rule of thumb: a sidebar component should look right at its real rendered width, not at the viewport width.

## General

- Mobile layouts lead with the primary workflow; supporting summaries and secondary panels come after.
- Keep filters next to the list/table they affect.
- Interactive targets stay easy to tap on mobile (≥44px).
- Repeated elements (cards, rows) keep stable dimensions.

## Verify (don't trust a single dev screenshot)

- Check narrow (375px), tablet (768px), and desktop (1280px) widths.
- Prefer a **production** build for visual checks — `next dev` can show transient layout during Fast Refresh.
- The reliable check is measuring element geometry: a section's right edge must not exceed its column, and adjacent sections must not overlap. `buildable preview` (optional) can render and screenshot; assert rects for sidebar/grid layouts.
