"use client";

import { useState } from "react";
import { InventorySummary } from "@/components/inventory-summary";
import { InventoryTable } from "@/components/inventory-table";
import { sampleItems } from "@/lib/sample-items";
import type { InventoryItem, ItemFilters } from "@/types/item";

const emptyFilters: ItemFilters = { query: "", category: "all", lowStockOnly: false };

export default function InventoryManager() {
  const [items, setItems] = useState<InventoryItem[]>(sampleItems);
  const [filters, setFilters] = useState<ItemFilters>(emptyFilters);

  const adjust = (id: string, delta: number) =>
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta), updatedAt: new Date().toISOString().slice(0, 10) }
          : item
      )
    );

  return (
    <main className="min-h-screen bg-[#f7f8fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6">
        <header>
          <h1 className="text-2xl font-bold text-ink">Stockroom</h1>
          <p className="text-sm text-slate-500">
            Track quantities, watch low stock, and receive or consume items — all on local data.
          </p>
        </header>

        <InventorySummary items={items} />
        <InventoryTable items={items} filters={filters} onFilters={setFilters} onAdjust={adjust} />
      </div>
    </main>
  );
}
