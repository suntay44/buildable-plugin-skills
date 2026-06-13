# Block: Web Filterable Table

A primary-entity list users scan, search, sort, filter, and act on repeatedly. The backbone of data-dense web apps.

## When to use

- data-dense web apps: CRM leads, inventory items, orders, jobs, posts, products, records
- operator dashboards where comparison and triage matter
- any screen whose main job is "find the right record, then act on it"

## Data shape

```ts
type Props<T> = {
  items: T[];                 // 6+ realistic records
  filters: FilterState;        // query + 2-4 domain filters
  onFilters: (next: FilterState) => void;
  onSelect?: (id: string) => void;     // pairs with web/detail-panel
  onRowAction?: (id: string, action: string) => void;
};
// Derive the visible rows from items + filters in a pure helper (lib/*-utils.ts),
// never inside the component, so filtering survives a storage/rung change.
```

## Required states

- **populated** — the normal case, sorted sensibly (newest-first or by a meaningful key)
- **empty** — no records yet (use web/empty-state)
- **filtered-empty** — filters match nothing, with a visible "clear filters" action
- **loading / saving** — skeleton rows or a quiet indicator, not a layout shift
- **row-level** — selected/active row is visually distinct

## Accessibility

- real `<th>` headers; associate each filter control with a `<label>`
- status shown with text + shape, never color alone
- selected row marked with `aria-current`; row actions have `aria-label`s
- keyboard: controls and row actions reachable in a sensible tab order

## Responsive

- desktop: 5–7 useful columns max; right-align numerics
- narrow: collapse secondary fields into a subtitle line, or wrap the table in `overflow-x-auto` — never let it push the page wide
- keep filters directly above the table they affect; stack them on mobile

## Code sketch

```tsx
<section aria-label={entityPlural}>
  <FilterBar filters={filters} onChange={onFilters} resultCount={visible.length} />
  {visible.length === 0
    ? <EmptyState variant={filters.active ? "filtered" : "empty"} onReset={clear} />
    : <table>{/* th headers + visible.map(row => <tr aria-current=…>) */}</table>}
</section>
```

## Adapt to the app spec

- [ ] use the primary entity name in the title and empty copy
- [ ] pick 2–4 filters from real fields (status, stage, category, owner, date, priority)
- [ ] choose columns that matter for *this* domain, not generic Name/Status/Date
- [ ] put row actions inline without hiding the main workflow
- [ ] keep filter + search logic in a pure util the detail-panel can share

## Avoid

- generic `Name / Status / Date` tables when the domain has richer fields
- color-only status signals
- horizontal overflow that hides primary actions
- filters placed far from the table they affect
