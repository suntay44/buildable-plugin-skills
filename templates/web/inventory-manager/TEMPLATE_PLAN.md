# Inventory Manager Template Plan

Runnable golden starter for the `inventory-manager` archetype: an operations dashboard — summary metrics, a stock table with category/search filters and low-stock highlighting, and inline receive/consume quantity adjustment.

## Structure

- `app/page.tsx` — client workspace: filter state, low-stock toggle, quantity adjustments
- `components/inventory-summary.tsx` — metric cards: total value, item count, low-stock count
- `components/inventory-table.tsx` — sortable-feeling stock table, low-stock rows flagged, +/- quantity controls
- `lib/sample-items.ts` — 10 realistic items across categories with some below reorder level
- `lib/inventory-utils.ts` — filtering, low-stock test, total value, formatting
- `types/item.ts` — `InventoryItem`, `ItemFilters`

## Acceptance Checklist

- summary cards have context (value, counts), not bare numbers
- low-stock items (quantity <= reorderLevel) are visually flagged and filterable
- receive/consume adjusts quantity and updates totals live
- category filter + search combine; result count shown
- filtered-empty state with a clear-filters action
- table does not overflow on mobile (horizontal scroll or stacked)

## Non-Goals

- no barcode hardware, hosted database, or supplier APIs — items stay in local state
