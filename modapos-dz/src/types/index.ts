// â”€â”€â”€ Enums â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export type UserRole = "admin" | "cashier";
export type SaleStatus = "completed" | "refunded" | "pending";

// â”€â”€â”€ Domain Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface User {
  id: number;
  name: string;
  username?: string;
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
  amountPaid: number;
  status: SaleStatus;
  paymentMethod: "cash" | "card" | "transfer";
  receiptNumber?: string;
  notes?: string;
  createdAt: string;
  items: SaleItem[];
}

// â”€â”€â”€ POS Cart Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
  amountPaid?: number; // stored for debt tracking
  notes?: string;
}

// â”€â”€â”€ Customer Module â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
  totalAmountPaid: number;
  debt: number;
  lastPurchaseDate?: string;
}

export interface CustomerWithStats extends Customer {
  totalOrders: number;
  totalSpent: number;
  debt: number;
  lastPurchaseDate?: string;
}

export interface CustomerDetail extends Customer {
  sales: Sale[];
  stats: CustomerStats;
}

export interface PaginatedCustomers {
  customers: CustomerWithStats[];
  total: number;
  page: number;
  pageSize: number;
}

// â”€â”€â”€ Sales History Module â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface SaleSummary {
  id: number;
  receiptNumber?: string;
  user?: Pick<User, "id" | "name">;
  customer?: Pick<Customer, "id" | "name" | "phone"> | null;
  total: number;
  discount: number;
  amountPaid: number;
  status: SaleStatus;
  paymentMethod: "cash" | "card" | "transfer";
  items: { id: number; quantity: number }[];
  createdAt: string;
}

export interface PaginatedSales {
  sales: SaleSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SalesFilters {
  search: string;
  paymentMethod: string;
  status: string;
  from: string;
  to: string;
}

// —————————————————————————————————————————————————————————————————————
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

// â”€â”€â”€ Auth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface AuthSession {
  user: User;
}

// â”€â”€â”€ IPC â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
declare global {
  interface Window {
    api: {
      invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
      on: (channel: string, callback: (...args: unknown[]) => void) => void;
      off: (channel: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

// ─── Dashboard ────────────────────────────────────────────
export interface DashboardStats {
  todayRevenue: number;
  todaySalesCount: number;
  monthRevenue: number;
  monthSalesCount: number;
  totalProducts: number;
  totalCustomers: number;
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

export interface PaymentDataPoint {
  name: string;
  value: number;
}

export interface TopProduct {
  id: number;
  name: string;
  size?: string;
  color?: string;
  quantitySold: number;
  revenueGenerated: number;
}

export interface LowStockVariant {
  id: number;
  stock: number;
  size: string;
  color: string;
  product: { name: string };
}

export interface DashboardSummary {
  kpis: DashboardStats;
  lowStockVariants: LowStockVariant[];
  recentSales: RecentSale[];
  revenueChart: RevenueDataPoint[];
  paymentMethods: PaymentDataPoint[];
  topProducts: TopProduct[];
}



// ─── Settings & Users ─────────────────────────────────────
export interface AppSettings {
  storeName: string;
  storePhone: string;
  storeAddress: string;
  receiptFooter: string;
}

export interface BackupItem {
  id: number;
  filename: string;
  size: number;
  type: string;
  createdAt: string;
}

// ─── Debt Management Module ────────────────────────────────

export interface DebtPayment {
  id: number;
  customerId: number;
  saleId?: number | null;
  amount: number;
  method: string;
  note?: string | null;
  createdAt: string;
}

/** A row in the debts table — one entry per customer */
export interface CustomerDebtSummary {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  createdAt: string;
  totalPurchases: number;
  totalPaid: number;
  currentDebt: number;
  lastPurchaseDate?: string;
  salesCount: number;
}

/** KPI statistics for the debt dashboard */
export interface DebtStatistics {
  totalDebt: number;
  debtorCount: number;
  recoveredThisMonth: number;
  avgDebtPerDebtor: number;
}

/** Sale row inside the customer debt modal */
export interface DebtSaleRow {
  id: number;
  receiptNumber?: string | null;
  total: number;
  amountPaid: number;
  remaining: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

/** Full data for the customer debt detail modal */
export interface DebtCustomerDetail {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  createdAt: string;
  summary: {
    totalPurchases: number;
    totalPaid: number;
    currentDebt: number;
  };
  sales: DebtSaleRow[];
  payments: DebtPayment[];
}

export interface AddPaymentPayload {
  customerId: number;
  amount: number;
  method: "cash" | "card" | "transfer";
  note?: string;
}

export interface PaginatedDebtCustomers {
  customers: CustomerDebtSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export type DebtFilter = "all" | "with_debt" | "no_debt" | "gt_10k" | "gt_50k";
export type DebtSort = "debt_asc" | "debt_desc" | "name_asc" | "name_desc";

