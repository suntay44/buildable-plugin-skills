# Data-Dense Surface Rubric

Use for dashboards, CRMs, admin panels, marketplaces, inventory/asset trackers, and helpdesks — surfaces built for scanning, triage, and comparison. Score each category 0 to 3. Pairs with `knowledge/quality-rubrics/web-app.md` (base) and the registry `foundations`.

## Categories

- `Scan Efficiency`: lists, tables, and metrics are scannable on a predictable grid; the user can triage without opening every item.
- `Metric Context`: every metric is paired with a delta, comparison, or label — no bare numbers.
- `Filter & Sort`: search, filters, sort, and a result count sit together and reflect active state with chips.
- `Table Quality`: real column headers, aligned numerics, `min-w-0` on text cells, and horizontal scroll instead of overflow. Follow `knowledge/ui-patterns/tables.md`.
- `Density`: compact spacing from the `spacingScale` that stays legible; rows do not shift when state changes.
- `State Coverage`: populated, empty, filtered-empty, loading, and error states all handled. `buildable review` warns (`state-coverage`) on a missing empty state.
- `Responsiveness`: dense multi-column layouts collapse without overlap; sidebars stack rather than using viewport-keyed grids. Follow `knowledge/ui-patterns/responsive-layouts.md` — pair fixed tracks with `minmax(0,1fr)`.
- `Token Discipline`: status colors map to semantic tokens (success/warning/danger), not raw hex. `buildable review` warns (`design-tokens`) on palette bypass.
- `Accessibility`: table headers, non-color-only status, focus-visible rows and controls.
- `Local-First`: mock data only; no hosted database, auth, or billing unless explicitly requested.

## Passing Bar

Average at least 2.5 with no score below 2. `Scan Efficiency` and `State Coverage` must each be at least 2.

## Automatic Failures

- primary table or list overflows or overlaps its container
- metrics shown without any context or comparison
- no empty / filtered-empty state on a filterable surface
- filters present but active state is invisible
- adds a hosted database, auth, or billing layer that was not requested
