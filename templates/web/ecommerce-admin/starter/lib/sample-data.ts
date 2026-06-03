import type { Order, Product } from "@/types/commerce";

export const sampleProducts: Product[] = [
  { id: "p-1", name: "Aero Running Shoe", sku: "AER-RUN-42", price: 128, stock: 4, reorderLevel: 6, category: "Footwear", status: "active" },
  { id: "p-2", name: "Trail Daypack 20L", sku: "TRL-PK-20", price: 89, stock: 23, reorderLevel: 8, category: "Bags", status: "active" },
  { id: "p-3", name: "Merino Base Layer", sku: "MER-BL-M", price: 64, stock: 2, reorderLevel: 5, category: "Apparel", status: "active" },
  { id: "p-4", name: "Insulated Bottle 750ml", sku: "INS-BTL-750", price: 32, stock: 51, reorderLevel: 12, category: "Accessories", status: "active" },
  { id: "p-5", name: "Summit Down Jacket", sku: "SUM-DWN-L", price: 240, stock: 9, reorderLevel: 4, category: "Apparel", status: "active" },
  { id: "p-6", name: "Quick-Dry Cap", sku: "QD-CAP-OS", price: 24, stock: 0, reorderLevel: 10, category: "Accessories", status: "draft" },
  { id: "p-7", name: "Classic Wool Sweater", sku: "CLS-WL-XL", price: 110, stock: 14, reorderLevel: 6, category: "Apparel", status: "archived" },
  { id: "p-8", name: "Trekking Pole Pair", sku: "TRK-POL-2", price: 75, stock: 3, reorderLevel: 5, category: "Gear", status: "active" }
];

export const sampleOrders: Order[] = [
  {
    id: "o-1",
    number: "1042",
    customerName: "Dana Whitfield",
    total: 217,
    status: "pending",
    placedAt: "2026-06-01",
    items: [
      { productId: "p-1", quantity: 1, unitPrice: 128 },
      { productId: "p-3", quantity: 1, unitPrice: 64 },
      { productId: "p-6", quantity: 1, unitPrice: 24 }
    ]
  },
  {
    id: "o-2",
    number: "1041",
    customerName: "Marcus Lee",
    total: 89,
    status: "paid",
    placedAt: "2026-05-31",
    items: [{ productId: "p-2", quantity: 1, unitPrice: 89 }]
  },
  {
    id: "o-3",
    number: "1040",
    customerName: "Priya Nair",
    total: 304,
    status: "fulfilled",
    placedAt: "2026-05-31",
    items: [
      { productId: "p-5", quantity: 1, unitPrice: 240 },
      { productId: "p-4", quantity: 2, unitPrice: 32 }
    ]
  },
  {
    id: "o-4",
    number: "1039",
    customerName: "Tomas Berg",
    total: 64,
    status: "refunded",
    placedAt: "2026-05-30",
    items: [{ productId: "p-3", quantity: 1, unitPrice: 64 }]
  },
  {
    id: "o-5",
    number: "1038",
    customerName: "Aisha Rahman",
    total: 182,
    status: "fulfilled",
    placedAt: "2026-05-29",
    items: [
      { productId: "p-8", quantity: 1, unitPrice: 75 },
      { productId: "p-1", quantity: 1, unitPrice: 107 }
    ]
  },
  {
    id: "o-6",
    number: "1037",
    customerName: "Greg Olsen",
    total: 32,
    status: "pending",
    placedAt: "2026-05-29",
    items: [{ productId: "p-4", quantity: 1, unitPrice: 32 }]
  }
];
