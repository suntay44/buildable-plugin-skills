"use client";

import { categoriesOf, filterItems, formatCurrency, isLowStock } from "@/lib/inventory-utils";
import type { InventoryItem, ItemFilters } from "@/types/item";

type Props = {
  items: InventoryItem[];
  filters: ItemFilters;
  onFilters: (filters: ItemFilters) => void;
  onAdjust: (id: string, delta: number) => void;
};

export function InventoryTable({ items, filters, onFilters, onAdjust }: Props) {
  const visible = filterItems(items, filters);
  const categories = categoriesOf(items);

  return (
    <section aria-label="Inventory" className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto] sm:items-end">
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Search items
          <input
            value={filters.query}
            onChange={(event) => onFilters({ ...filters, query: event.target.value })}
            placeholder="Search name, SKU, or location"
            className="h-11 rounded-md border border-slate-300 px-3 text-base"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Category
          <select
            value={filters.category}
            onChange={(event) => onFilters({ ...filters, category: event.target.value })}
            className="h-11 rounded-md border border-slate-300 px-3 text-base"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label className="flex h-11 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={filters.lowStockOnly}
            onChange={(event) => onFilters({ ...filters, lowStockOnly: event.target.checked })}
            className="h-4 w-4"
          />
          Low stock only
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No items match these filters. Clear the search or filters to see the full inventory.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead className="bg-mist text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2 font-semibold">Item</th>
                <th className="px-3 py-2 font-semibold">Category</th>
                <th className="px-3 py-2 text-right font-semibold">On hand</th>
                <th className="px-3 py-2 text-right font-semibold">Value</th>
                <th className="px-3 py-2 text-right font-semibold">Adjust</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => (
                <tr key={item.id} className={`border-t border-slate-100 ${isLowStock(item) ? "bg-coral/5" : ""}`}>
                  <td className="px-3 py-2">
                    <span className="font-medium text-ink">{item.name}</span>
                    <span className="block text-xs text-slate-500">
                      {item.sku} · {item.location}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-600">{item.category}</td>
                  <td className="px-3 py-2 text-right">
                    <span className={isLowStock(item) ? "font-semibold text-coral" : "text-ink"}>{item.quantity}</span>
                    {isLowStock(item) ? <span className="block text-xs text-coral">Reorder ≤ {item.reorderLevel}</span> : null}
                  </td>
                  <td className="px-3 py-2 text-right text-ink">{formatCurrency(item.quantity * item.unitCost)}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        aria-label={`Consume one ${item.name}`}
                        onClick={() => onAdjust(item.id, -1)}
                        disabled={item.quantity === 0}
                        className="h-8 w-8 rounded-md border border-slate-300 font-semibold text-slate-600 disabled:opacity-40"
                      >
                        −
                      </button>
                      <button
                        type="button"
                        aria-label={`Receive one ${item.name}`}
                        onClick={() => onAdjust(item.id, 1)}
                        className="h-8 w-8 rounded-md border border-slate-300 font-semibold text-slate-600"
                      >
                        +
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
