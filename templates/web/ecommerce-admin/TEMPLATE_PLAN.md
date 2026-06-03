# Web Ecommerce Admin Golden Template Plan

## Product Shape

One polished store-admin workspace: KPI overview plus product and order management on local data.

## Proposed File Structure

```txt
app/
  layout.tsx
  page.tsx
components/
  overview-cards.tsx
  product-table.tsx
  order-table.tsx
lib/
  sample-data.ts
  commerce-utils.ts
types/
  commerce.ts
```

## Required Features

- overview KPIs (revenue, orders, pending, low stock)
- product table: search, status filter, low-stock highlight, stock adjust
- order table: status filter, advance fulfillment status
- empty and filtered-empty table states

## Sample Data

Include 8 to 12 products across categories (some low/zero stock, mixed statuses) and 6 to 10 orders spanning every status.

## Validation Hints

- Adjusting stock updates the low-stock KPI and highlighting.
- Advancing an order status updates the overview and recent-orders list.
- Tables stay usable on mobile (horizontal scroll is acceptable).
