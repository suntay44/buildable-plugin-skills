"use client";

import { useState } from "react";
import { OrderTable } from "@/components/order-table";
import { OverviewCards } from "@/components/overview-cards";
import { ProductTable } from "@/components/product-table";
import { formatCurrency, nextOrderStatus, orderStatusLabels } from "@/lib/commerce-utils";
import { sampleOrders, sampleProducts } from "@/lib/sample-data";
import type { Order, OrderStatus, Product, ProductFilters } from "@/types/commerce";

type Tab = "overview" | "products" | "orders";

const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "products", label: "Products" },
  { id: "orders", label: "Orders" }
];

export default function Home() {
  const [tab, setTab] = useState<Tab>("overview");
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [orders, setOrders] = useState<Order[]>(sampleOrders);
  const [productFilters, setProductFilters] = useState<ProductFilters>({ query: "", status: "all" });
  const [orderStatus, setOrderStatus] = useState<"all" | OrderStatus>("all");

  function adjustStock(id: string, delta: number) {
    setProducts((current) =>
      current.map((product) => (product.id === id ? { ...product, stock: Math.max(0, product.stock + delta) } : product))
    );
  }

  function advanceOrder(id: string) {
    setOrders((current) =>
      current.map((order) => (order.id === id ? { ...order, status: nextOrderStatus(order.status) } : order))
    );
  }

  const recentOrders = [...orders].sort((a, b) => b.placedAt.localeCompare(a.placedAt)).slice(0, 4);

  return (
    <main className="min-h-screen bg-[#f7f8fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6">
        <header className="grid gap-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-ocean">Local-first prototype</p>
          <h1 className="text-3xl font-bold text-ink sm:text-4xl">CommerceDesk</h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Manage catalog and orders for a small store: watch revenue and low stock, adjust inventory, and move orders through fulfillment — all on local data.
          </p>
        </header>

        <OverviewCards products={products} orders={orders} />

        <nav aria-label="Sections" className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              aria-pressed={tab === item.id}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold ${
                tab === item.id ? "bg-ocean text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {tab === "overview" ? (
          <section aria-label="Recent orders" className="grid gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-ink">Recent orders</h2>
            <ul className="grid gap-2">
              {recentOrders.map((order) => (
                <li key={order.id} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <div>
                    <span className="font-medium text-ink">#{order.number}</span>
                    <span className="ml-2 text-sm text-slate-500">{order.customerName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">{orderStatusLabels[order.status]}</span>
                    <span className="font-medium text-ink">{formatCurrency(order.total)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {tab === "products" ? (
          <ProductTable products={products} filters={productFilters} onFilters={setProductFilters} onAdjustStock={adjustStock} />
        ) : null}

        {tab === "orders" ? (
          <OrderTable orders={orders} status={orderStatus} onStatus={setOrderStatus} onAdvance={advanceOrder} />
        ) : null}
      </div>
    </main>
  );
}
