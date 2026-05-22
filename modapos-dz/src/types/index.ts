// ─── Enums ────────────────────────────────────────────────
export type UserRole = "admin" | "cashier";
export type SaleStatus = "completed" | "refunded" | "pending";

// ─── Domain Types ─────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  _count?: { products: number };
}

export interface ProductVariant {
  id: number;
  productId: number;
  size: string;
  color: string;
  stock: number;
  barcode?: string;
  product?: Product;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description?: string;
  price: number;
  categoryId?: number;
  category?: Category;
  variants: ProductVariant[];
  imagePath?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: string;
  _count?: { sales: number };
  sales?: Sale[];
}

export interface SaleItem {
  id: number;
  saleId: number;
  variantId: number;
  variant?: ProductVariant;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export interface Sale {
  id: number;
  userId: number;
  user?: Pick<User, "id" | "name">;
  customerId?: number;
  customer?: Pick<Customer, "id" | "name" | "phone"> | null;
  total: number;
  discount: number;
  tax: number;
  status: SaleStatus;
  paymentMethod: "cash" | "card" | "transfer";
  notes?: string;
  createdAt: string;
  items: SaleItem[];
}

// ─── POS Cart Types ────────────────────────────────────────
export interface CartItem {
  variantId: number;
  productId: number;
  productName: string;
  sku: string;
  size: string;
  color: string;
  imagePath?: string;
  unitPrice: number;
  quantity: number;
  discount: number; // per-item DZD discount
  maxStock: number;
}

export type PaymentMethod = "cash" | "card" | "transfer";

export interface POSCheckoutPayload {
  userId: number;
  customerId?: number;
  items: Array<{
    variantId: number;
    quantity: number;
    unitPrice: number;
    discount: number;
  }>;
  total: number;
  discount: number; // cart-level discount in DZD
  tax: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

// ─── Dashboard ────────────────────────────────────────────
export interface DashboardStats {
  todayRevenue: number;
  todaySalesCount: number;
  monthRevenue: number;
  monthSalesCount: number;
  totalProducts: number;
  lowStockCount: number;
  totalCustomers: number;
  recentSales: RecentSale[];
}

export interface RecentSale {
  id: number;
  total: number;
  createdAt: string;
  customer?: { name: string } | null;
  items: { quantity: number }[];
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
}

// ─── Products Module ─────────────────────────────────────
export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProductStats {
  totalProducts: number;
  totalVariants: number;
  lowStockVariants: number;
}

export interface ProductFormData {
  name: string;
  sku: string;
  price: string;
  description?: string;
  categoryId?: string;
  imagePath?: string;
  variants: VariantFormRow[];
}

export interface VariantFormRow {
  id?: number;
  size: string;
  color: string;
  stock: number;
  barcode?: string;
}

// ─── Auth ─────────────────────────────────────────────────
export interface AuthSession {
  user: User;
}

// ─── IPC ──────────────────────────────────────────────────
declare global {
  interface Window {
    api: {
      invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
      on: (channel: string, callback: (...args: unknown[]) => void) => void;
      off: (channel: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}
