import type { Order, OrderStatus, Product, ProductFilters, ProductStatus } from "@/types/commerce";

export const productStatusLabels: Record<ProductStatus, string> = {
  active: "Active",
  draft: "Draft",
  archived: "Archived"
};

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  fulfilled: "Fulfilled",
  refunded: "Refunded"
};

export const orderStatusOrder: OrderStatus[] = ["pending", "paid", "fulfilled", "refunded"];

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function isLowStock(product: Product) {
  return product.status === "active" && product.stock <= product.reorderLevel;
}

export function kpis(products: Product[], orders: Order[]) {
  const revenue = orders.filter((order) => order.status !== "refunded").reduce((total, order) => total + order.total, 0);
  return {
    revenue,
    orders: orders.length,
    pending: orders.filter((order) => order.status === "pending").length,
    lowStock: products.filter(isLowStock).length,
    activeProducts: products.filter((product) => product.status === "active").length
  };
}

export function filterProducts(products: Product[], filters: ProductFilters) {
  const query = filters.query.trim().toLowerCase();
  return products.filter((product) => {
    const statusMatch = filters.status === "all" || product.status === filters.status;
    const queryMatch =
      query.length === 0 ||
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query);
    return statusMatch && queryMatch;
  });
}

export function filterOrders(orders: Order[], status: "all" | OrderStatus) {
  const sorted = [...orders].sort((a, b) => b.placedAt.localeCompare(a.placedAt));
  return status === "all" ? sorted : sorted.filter((order) => order.status === status);
}

export function nextOrderStatus(status: OrderStatus): OrderStatus {
  const flow: OrderStatus[] = ["pending", "paid", "fulfilled"];
  const index = flow.indexOf(status);
  if (index === -1 || index === flow.length - 1) return status;
  return flow[index + 1];
}
