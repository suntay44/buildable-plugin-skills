import type { InventoryItem } from "@/types/item";

export const sampleItems: InventoryItem[] = [
  { id: "i1", name: "Oat milk carton (1L)", sku: "BEV-OAT-1L", category: "Beverages", quantity: 48, reorderLevel: 24, unitCost: 1.8, location: "Aisle 3 · Bay A", updatedAt: "2026-06-09" },
  { id: "i2", name: "Cold brew concentrate", sku: "BEV-CB-32", category: "Beverages", quantity: 9, reorderLevel: 12, unitCost: 6.5, location: "Aisle 3 · Bay B", updatedAt: "2026-06-08" },
  { id: "i3", name: "Sourdough loaf", sku: "BAK-SDH-01", category: "Bakery", quantity: 22, reorderLevel: 15, unitCost: 2.25, location: "Front · Rack 1", updatedAt: "2026-06-10" },
  { id: "i4", name: "Almond croissant", sku: "BAK-ALC-12", category: "Bakery", quantity: 6, reorderLevel: 18, unitCost: 1.4, location: "Front · Rack 2", updatedAt: "2026-06-10" },
  { id: "i5", name: "Free-range eggs (dozen)", sku: "DRY-EGG-12", category: "Dairy", quantity: 31, reorderLevel: 20, unitCost: 3.1, location: "Cooler · Shelf 2", updatedAt: "2026-06-07" },
  { id: "i6", name: "Aged cheddar block", sku: "DRY-CHD-08", category: "Dairy", quantity: 4, reorderLevel: 10, unitCost: 5.75, location: "Cooler · Shelf 4", updatedAt: "2026-06-06" },
  { id: "i7", name: "Compostable cups (50ct)", sku: "SUP-CUP-50", category: "Supplies", quantity: 60, reorderLevel: 30, unitCost: 4.2, location: "Stockroom · Bin 7", updatedAt: "2026-06-05" },
  { id: "i8", name: "Kraft napkins (500ct)", sku: "SUP-NAP-500", category: "Supplies", quantity: 14, reorderLevel: 16, unitCost: 3.6, location: "Stockroom · Bin 9", updatedAt: "2026-06-04" },
  { id: "i9", name: "House blend beans (5lb)", sku: "BEV-BNS-5", category: "Beverages", quantity: 18, reorderLevel: 10, unitCost: 22, location: "Aisle 3 · Bay C", updatedAt: "2026-06-09" },
  { id: "i10", name: "Granola pouch (12oz)", sku: "DRY-GRN-12", category: "Dry goods", quantity: 27, reorderLevel: 15, unitCost: 4.95, location: "Aisle 5 · Bay A", updatedAt: "2026-06-03" }
];
