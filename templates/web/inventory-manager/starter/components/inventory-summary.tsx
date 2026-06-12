import { formatCurrency, lowStockCount, totalValue } from "@/lib/inventory-utils";
import type { InventoryItem } from "@/types/item";

export function InventorySummary({ items }: { items: InventoryItem[] }) {
  const lowStock = lowStockCount(items);
  const cards = [
    { label: "Inventory value", value: formatCurrency(totalValue(items)) },
    { label: "Distinct items", value: String(items.length) },
    { label: "Low stock", value: String(lowStock), tone: lowStock > 0 ? "text-coral" : "text-ink" }
  ];

  return (
    <section aria-label="Inventory summary" className="grid gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{card.label}</p>
          <p className={`mt-1 text-2xl font-bold ${card.tone ?? "text-ink"}`}>{card.value}</p>
        </div>
      ))}
    </section>
  );
}
