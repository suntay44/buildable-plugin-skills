"use client";

import { filterProducts, formatCurrency, isLowStock, productStatusLabels } from "@/lib/commerce-utils";
import type { Product, ProductFilters, ProductStatus } from "@/types/commerce";

type Props = {
  products: Product[];
  filters: ProductFilters;
  onFilters: (filters: ProductFilters) => void;
  onAdjustStock: (id: string, delta: number) => void;
};

const statusOptions: ("all" | ProductStatus)[] = ["all", "active", "draft", "archived"];

const statusTone: Record<ProductStatus, string> = {
  active: "bg-emerald-50 text-meadow",
  draft: "bg-slate-100 text-slate-600",
  archived: "bg-amber/10 text-amber"
};

export function ProductTable({ products, filters, onFilters, onAdjustStock }: Props) {
  const visible = filterProducts(products, filters);

  return (
    <section aria-label="Products" className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Search products
          <input
            value={filters.query}
            onChange={(event) => onFilters({ ...filters, query: event.target.value })}
            placeholder="Search name, SKU, or category"
            className="h-11 rounded-md border border-slate-300 px-3 text-base"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Status
          <select
            value={filters.status}
            onChange={(event) => onFilters({ ...filters, status: event.target.value as ProductFilters["status"] })}
            className="h-11 rounded-md border border-slate-300 px-3 text-base"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status === "all" ? "All" : productStatusLabels[status]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          No products match your search. Clear the filters to see the full catalog.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-mist text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2 font-semibold">Product</th>
                <th className="hidden px-3 py-2 font-semibold sm:table-cell">Status</th>
                <th className="px-3 py-2 text-right font-semibold">Price</th>
                <th className="px-3 py-2 text-right font-semibold">Stock</th>
                <th className="px-3 py-2 text-right font-semibold">Adjust</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((product) => (
                <tr key={product.id} className="border-t border-slate-100">
                  <td className="px-3 py-2">
                    <span className="font-medium text-ink">{product.name}</span>
                    <span className="block text-xs text-slate-500">{product.sku} · {product.category}</span>
                  </td>
                  <td className="hidden px-3 py-2 sm:table-cell">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusTone[product.status]}`}>
                      {productStatusLabels[product.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-ink">{formatCurrency(product.price)}</td>
                  <td className="px-3 py-2 text-right">
                    <span className={isLowStock(product) ? "font-semibold text-coral" : "text-ink"}>{product.stock}</span>
                    {isLowStock(product) ? <span className="block text-xs text-coral">Low</span> : null}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        aria-label={`Decrease stock for ${product.name}`}
                        onClick={() => onAdjustStock(product.id, -1)}
                        className="h-8 w-8 rounded-md border border-slate-300 font-semibold text-slate-600"
                      >
                        −
                      </button>
                      <button
                        type="button"
                        aria-label={`Increase stock for ${product.name}`}
                        onClick={() => onAdjustStock(product.id, 1)}
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
