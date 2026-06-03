export type ProductStatus = "active" | "draft" | "archived";
export type OrderStatus = "pending" | "paid" | "fulfilled" | "refunded";

export type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  reorderLevel: number;
  category: string;
  status: ProductStatus;
};

export type OrderItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  id: string;
  number: string;
  customerName: string;
  total: number;
  status: OrderStatus;
  placedAt: string;
  items: OrderItem[];
};

export type ProductFilters = {
  query: string;
  status: "all" | ProductStatus;
};
