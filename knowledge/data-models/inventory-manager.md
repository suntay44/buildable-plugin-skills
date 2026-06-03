# Inventory Manager Data Model

## Entities

```ts
type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  reorderLevel: number;
  unitCost: number;
  location: string;
  updatedAt: string;
};
```

## Derived Values

- total inventory value
- low-stock items (quantity <= reorderLevel)
- items filtered by category/location or search
- quantity adjustments (receive / consume)

## Notes

- Keep items in local state for a prototype.
- Do not add barcode hardware, a hosted database, or supplier APIs unless requested.
