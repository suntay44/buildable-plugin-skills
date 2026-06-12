import type { InventoryItem, ItemFilters } from "@/types/item";

export function isLowStock(item: InventoryItem): boolean {
  return item.quantity <= item.reorderLevel;
}

export function filterItems(items: InventoryItem[], filters: ItemFilters): InventoryItem[] {
  const query = filters.query.trim().toLowerCase();
  return items
    .filter((item) => (filters.category === "all" ? true : item.category === filters.category))
    .filter((item) => (filters.lowStockOnly ? isLowStock(item) : true))
    .filter((item) =>
      query === ""
        ? true
        : [item.name, item.sku, item.location].some((value) => value.toLowerCase().includes(query))
    )
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function categoriesOf(items: InventoryItem[]): string[] {
  return [...new Set(items.map((item) => item.category))].sort();
}

export function totalValue(items: InventoryItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
}

export function lowStockCount(items: InventoryItem[]): number {
  return items.filter(isLowStock).length;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}
