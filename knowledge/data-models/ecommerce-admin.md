# Ecommerce Admin Data Model

## Entities

```ts
type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  status: "active" | "draft" | "archived";
};

type Order = {
  id: string;
  number: string;
  customerName: string;
  total: number;
  status: "pending" | "paid" | "fulfilled" | "refunded";
  placedAt: string;
  items: OrderItem[];
};

type OrderItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
};
```

## Derived Values

- revenue and order counts by status
- low-stock products
- products filtered by category/status
- recent orders

## Notes

- Keep catalog and orders in local state for a prototype.
- Do not add real payments, fulfillment, or a hosted store backend unless requested.
