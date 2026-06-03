"use client";

import { filterOrders, formatCurrency, nextOrderStatus, orderStatusLabels, orderStatusOrder } from "@/lib/commerce-utils";
import type { Order, OrderStatus } from "@/types/commerce";

type Props = {
  orders: Order[];
  status: "all" | OrderStatus;
  onStatus: (status: "all" | OrderStatus) => void;
  onAdvance: (id: string) => void;
};

const statusTone: Record<OrderStatus, string> = {
  pending: "bg-amber/10 text-amber",
  paid: "bg-blue-50 text-ocean",
  fulfilled: "bg-emerald-50 text-meadow",
  refunded: "bg-red-50 text-coral"
};

export function OrderTable({ orders, status, onStatus, onAdvance }: Props) {
  const visible = filterOrders(orders, status);

  return (
    <section aria-label="Orders" className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        Filter orders
        <select
          value={status}
          onChange={(event) => onStatus(event.target.value as "all" | OrderStatus)}
          className="h-10 rounded-md border border-slate-300 px-2 text-sm"
        >
          <option value="all">All</option>
          {orderStatusOrder.map((value) => (
            <option key={value} value={value}>
              {orderStatusLabels[value]}
            </option>
          ))}
        </select>
      </label>

      {visible.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          No orders with this status. Choose “All” to see every order.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-mist text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2 font-semibold">Order</th>
                <th className="hidden px-3 py-2 font-semibold sm:table-cell">Customer</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 text-right font-semibold">Total</th>
                <th className="px-3 py-2 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((order) => (
                <tr key={order.id} className="border-t border-slate-100">
                  <td className="px-3 py-2">
                    <span className="font-medium text-ink">#{order.number}</span>
                    <span className="block text-xs text-slate-500">{order.placedAt} · {order.items.length} item(s)</span>
                  </td>
                  <td className="hidden px-3 py-2 text-slate-600 sm:table-cell">{order.customerName}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusTone[order.status]}`}>
                      {orderStatusLabels[order.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-ink">{formatCurrency(order.total)}</td>
                  <td className="px-3 py-2 text-right">
                    {order.status === "pending" || order.status === "paid" ? (
                      <button
                        type="button"
                        onClick={() => onAdvance(order.id)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Mark {orderStatusLabels[nextOrderStatus(order.status)].toLowerCase()}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
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
