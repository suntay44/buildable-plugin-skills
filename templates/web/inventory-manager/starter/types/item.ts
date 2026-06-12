export type InventoryItem = {
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

export type ItemFilters = {
  query: string;
  category: string;
  lowStockOnly: boolean;
};
