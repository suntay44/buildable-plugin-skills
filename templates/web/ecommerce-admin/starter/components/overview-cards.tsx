import { formatCurrency, kpis } from "@/lib/commerce-utils";
import type { Order, Product } from "@/types/commerce";

export function OverviewCards({ products, orders }: { products: Product[]; orders: Order[] }) {
  const stats = kpis(products, orders);
  const cards = [
    ["Revenue", formatCurrency(stats.revenue)],
    ["Orders", String(stats.orders)],
    ["Pending", String(stats.pending)],
    ["Low stock", String(stats.lowStock)]
  ];

  return (
    <section aria-label="Store overview" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
        </div>
      ))}
    </section>
  );
}
