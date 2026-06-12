# Buildable Inventory Manager Template

This is the runnable golden starter for the `inventory-manager` archetype.

- Archetype: `inventory-manager`
- Target: web
- Stack: Next.js, TypeScript, Tailwind CSS, local state
- Primary screen: `app/page.tsx` (summary cards + filterable stock table)
- Entity: `InventoryItem` (`types/item.ts`)
- Derived logic: `lib/inventory-utils.ts` (filtering, low-stock test, total value)
- Sample data: `lib/sample-items.ts` (some items below reorder level)

When adapting this starter, keep items in local state, preserve the low-stock highlighting and filtered-empty state, and do not add barcode hardware, a hosted database, or supplier APIs unless the user explicitly requests them.
