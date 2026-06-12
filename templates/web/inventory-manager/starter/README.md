# Stockroom — Inventory Manager Starter

An operations dashboard: summary metrics, a stock table with category/search filters and low-stock highlighting, and inline receive/consume quantity adjustment. Generated from the Buildable `inventory-manager` golden template.

```bash
npm install
npm run dev
```

Items are local state seeded from `lib/sample-items.ts`. Quantity adjustments update totals live — nothing is persisted to a backend.
