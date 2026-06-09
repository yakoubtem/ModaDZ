// â”€â”€â”€ Enums â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export type UserRole = "admin" | "manager" | "cashier";
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
  costPrice?: number;
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
  monthExpenses: number;
  monthCOGS: number;
  monthGrossProfit: number;
  netProfitMonth: number;
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
  expenseAlerts: ExpenseAlert[];
  debtWidget: {
    totalDebt: number;
    debtorCount: number;
    recoveryRate: number;
  };
  supplierDebtWidget: {
    totalSupplierDebt: number;
    debtorCount: number;
    topSupplierDebts: { id: number; name: string; currentDebt: number }[];
    upcomingPayments: {
      id: number;
      reference: string;
      supplierName: string;
      total: number;
      amountPaid: number;
      remaining: number;
      createdAt: string;
    }[];
  };
  openRegisters?: Array<{
    id: number;
    userId: number;
    userName: string;
    openedAt: string;
    openingBalance: number;
    expectedBalance: number;
  }>;
}



// ─── Settings & Users ─────────────────────────────────────
export interface AppSettings {
  storeName: string;
  storePhone: string;
  storeAddress: string;
  receiptFooter: string;
  expensesMonthlyBudget: string;
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
  recoveryRate: number; // percentage: (monthCollected / monthGeneratedDebt) * 100
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

// ─── Expense Management ──────────────────────────────────

export const DEFAULT_EXPENSE_CATEGORIES: string[] = [
  "Loyer",
  "Salaires",
  "Transport",
  "Marketing",
  "Fournisseurs",
  "Internet & Téléphone",
  "Électricité & Eau",
  "Maintenance",
  "Emballage",
  "Impôts & Taxes",
  "Divers",
];

export type ExpensePaymentMethod =
  | "Espèces"
  | "Carte"
  | "Virement"
  | "Chèque"
  | "Autre";

export const EXPENSE_PAYMENT_METHODS: ExpensePaymentMethod[] = [
  "Espèces",
  "Carte",
  "Virement",
  "Chèque",
  "Autre",
];

export interface Expense {
  id: number;
  title: string;
  description?: string | null;
  supplier?: string | null;
  notes?: string | null;
  amount: number;
  category: string;
  paymentMethod?: string | null;
  receiptPath?: string | null;
  expenseDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFormData {
  title: string;
  amount: number;
  category: string;
  expenseDate: string;
  paymentMethod?: string;
  description?: string;
  supplier?: string;
  notes?: string;
  receiptPath?: string;
}

export type ExpenseSort = "newest" | "oldest" | "highest" | "lowest";

export interface ExpenseFilters {
  search: string;
  category: string;
  supplier: string;
  paymentMethod: string;
  from: string;
  to: string;
  minAmount: string;
  maxAmount: string;
  sort: ExpenseSort;
}

export interface ExpenseSummary {
  monthTotal: number;
  todayTotal: number;
  weekTotal: number;
  yearTotal: number;
  monthChangePct: number;
  todayChangePct: number;
  weekChangePct: number;
  yearChangePct: number;
  topCategory: { name: string; amount: number; sharePct: number } | null;
  totalSalesMonth: number;
  netProfitMonth: number;
  netProfitChangePct: number;
}

export interface ExpenseCategoryRecord {
  id: number;
  name: string;
  isArchived: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseChartPoint {
  label: string;
  value: number;
}

export interface ExpenseRevenuePoint {
  label: string;
  revenue: number;
  expenses: number;
}

export interface NetProfitPoint {
  label: string;
  profit: number;
}

export interface ProfitabilitySummary {
  revenue: number;
  expenses: number;
  netProfit: number;
  marginPct: number;
  status: "excellent" | "moderate" | "low";
}

export interface ExpenseAlert {
  type: "high_expense" | "budget_exceeded" | "spike";
  title: string;
  message: string;
  severity: "info" | "warning" | "danger";
}

export interface ExpenseAnalytics {
  monthlyTrend: ExpenseChartPoint[];
  expensesByCategory: ExpenseChartPoint[];
  revenueVsExpenses: ExpenseRevenuePoint[];
  netProfitEvolution: NetProfitPoint[];
  profitability: ProfitabilitySummary;
  insights: string[];
  alerts: ExpenseAlert[];
}

export interface PaginatedExpenses {
  expenses: Expense[];
  total: number;
  page: number;
  pageSize: number;
}

// ─── Suppliers Management Types ──────────────────────────────
export interface Supplier {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierWithStats extends Supplier {
  totalPurchases: number;
  totalAmount: number;
  remainingDebt: number;
  lastPurchaseDate?: string | null;
}

export interface PaginatedSuppliers {
  suppliers: SupplierWithStats[];
  total: number;
  page: number;
  pageSize: number;
  summary?: {
    totalAmount: number;
    remainingDebt: number;
    activeCount: number;
  };
}

export interface SupplierFormData {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

// ─── Purchase Management Types ──────────────────────────────
export interface PurchaseItem {
  id: number;
  purchaseId: number;
  productId: number;
  product?: Product;
  variantId: number;
  variant?: ProductVariant;
  quantity: number;
  costPrice: number;
  total: number;
}

export interface Purchase {
  id: number;
  supplierId: number;
  supplier?: Supplier;
  reference: string;
  subtotal: number;
  discount: number;
  total: number;
  amountPaid: number;
  notes?: string | null;
  createdAt: string;
  items: PurchaseItem[];
  status: string;
}

export interface PaginatedPurchases {
  purchases: Purchase[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PurchaseItemFormData {
  productId: number;
  variantId: number;
  quantity: number;
  costPrice: number;
}

export interface PurchaseFormData {
  supplierId: number;
  reference: string;
  items: PurchaseItemFormData[];
  subtotal: number;
  discount: number;
  total: number;
  amountPaid: number;
  notes?: string;
}

export interface PurchaseSummary {
  totalPurchasesAmount: number;
  totalDebts: number;
  monthPurchasesAmount: number;
  avgPurchaseAmount: number;
}

// ─── Activity Log Types ─────────────────────────────────────
export interface ActivityLog {
  id: number;
  userId?: number | null;
  user?: { id: number; name: string } | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  description: string;
  createdAt: string;
}

export interface PaginatedActivityLogs {
  logs: ActivityLog[];
  total: number;
  page: number;
  pageSize: number;
}

// ─── Supplier Debt Management Module ───────────────────────

export interface SupplierPayment {
  id: number;
  supplierId: number;
  purchaseId?: number | null;
  amount: number;
  paymentMethod: string;
  reference?: string | null;
  notes?: string | null;
  createdAt: string;
  createdBy: number;
  user?: Pick<User, "id" | "name">;
}

/** A row in the supplier debts table — one entry per supplier */
export interface SupplierDebtSummary {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  createdAt: string;
  totalPurchases: number;
  totalPaid: number;
  currentDebt: number;
  lastPurchaseDate?: string;
  purchasesCount: number;
}

/** KPI statistics for the supplier debt dashboard */
export interface SupplierDebtStatistics {
  totalDebt: number;
  debtorCount: number;
  paidThisMonth: number;
  avgDebtPerDebtor: number;
}

/** Purchase row inside the supplier debt modal */
export interface DebtPurchaseRow {
  id: number;
  reference: string;
  total: number;
  amountPaid: number;
  remaining: number;
  status: string;
  createdAt: string;
}

/** Full data for the supplier debt detail modal */
export interface DebtSupplierDetail {
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
    lastPaymentDate?: string | null;
  };
  purchases: DebtPurchaseRow[];
  payments: SupplierPayment[];
  timeline: Array<{
    id: number;
    date: string;
    type: string; // "purchase" | "payment"
    reference: string;
    amount: number;
    runningBalance: number;
  }>;
}

export interface AddSupplierPaymentPayload {
  supplierId: number;
  amount: number;
  method: string;
  reference?: string;
  notes?: string;
  createdBy: number;
}

export interface PaginatedSupplierDebts {
  suppliers: SupplierDebtSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export type SupplierDebtFilter = "all" | "with_debt" | "no_debt" | "gt_10k" | "gt_50k";
export type SupplierDebtSort = "debt_asc" | "debt_desc" | "name_asc" | "name_desc";

// ─── Cash Register Management Types ───────────────────────

export interface CashSession {
  id: number;
  userId: number;
  openedAt: string;
  closedAt?: string | null;
  openingBalance: number;
  expectedBalance: number;
  actualBalance?: number | null;
  difference?: number | null;
  notes?: string | null;
  status: "open" | "closed";
  user?: Pick<User, "id" | "name">;
}

export interface CashMovement {
  id: number;
  sessionId: number;
  type: "sale" | "refund" | "expense" | "supplier_payment" | "cash_in" | "cash_out";
  amount: number;
  reason?: string | null;
  notes?: string | null;
  createdAt: string;
  createdBy: number;
  session?: {
    id: number;
    user?: { id: number; name: string };
  };
}

export interface CashSessionDetails {
  session: CashSession;
  breakdown: {
    openingBalance: number;
    sales: number;
    refunds: number;
    expenses: number;
    supplierPayments: number;
    cashIn: number;
    cashOut: number;
    expectedBalance: number;
  };
  movements: CashMovement[];
}

export interface CashRegisterStatistics {
  cashToday: number;
  cashMovementsCount: number;
  openSessionsCount: number;
  cashDifference: number;
  openRegisters: Array<{
    id: number;
    userId: number;
    userName: string;
    openedAt: string;
    openingBalance: number;
    expectedBalance: number;
  }>;
}

export type CashSessionFilter = "all" | "open" | "closed";
export type CashMovementTypeFilter = "all" | "sale" | "refund" | "expense" | "supplier_payment" | "cash_in" | "cash_out";



