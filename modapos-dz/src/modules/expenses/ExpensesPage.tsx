import { useState, useCallback } from "react";
import { Receipt } from "lucide-react";
import { useExpenses } from "./hooks/useExpenses";
import { ExpenseKPICards } from "./components/ExpenseKPICards";
import { ExpenseFilters } from "./components/ExpenseFilters";
import { ExpenseTable } from "./components/ExpenseTable";
import { ExpenseFormModal } from "./components/ExpenseFormModal";
import { ExpenseCharts } from "./components/ExpenseCharts";
import { ExpenseCategorySidebar } from "./components/ExpenseCategorySidebar";
import { ExpenseCategoryManager } from "./components/ExpenseCategoryManager";
import { ExpenseReportPrint } from "./components/ExpenseReportPrint";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";
import type { Expense, ExpenseFormData } from "@/types";
import { useSettings } from "@/modules/settings/hooks/useSettings";
import { EXPENSE_PAYMENT_METHODS } from "@/types";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

// ─── Export CSV helper ────────────────────────────────────

function exportCSV(data: object[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((h) => {
        const val = (row as Record<string, unknown>)[h];
        return typeof val === "string" && val.includes(",") ? `"${val}"` : String(val ?? "");
      })
      .join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Page ─────────────────────────────────────────────────

type Tab = "list" | "analytics" | "profitability" | "categories";

export function ExpensesPage() {
  const { t, isRtl } = useTranslation();
  const {
    expenses,
    summary,
    analytics,
    categories,
    total,
    page,
    pageSize,
    isLoading,
    isSummaryLoading,
    isAnalyticsLoading,
    isCategoriesLoading,
    search,
    category,
    supplier,
    paymentMethod,
    from,
    to,
    minAmount,
    maxAmount,
    sort,
    handleSearch,
    handleCategory,
    handleSupplier,
    handlePaymentMethod,
    handleDateRange,
    handleAmountRange,
    handleSort,
    handlePageChange,
    resetFilters,
    createCategory,
    updateCategory,
    archiveCategory,
    deleteCategory,
    getReportData,
    createExpense,
    updateExpense,
    deleteExpense,
  } = useExpenses();

  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState<Tab>("list");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const tabs = [
    { id: "list" as const, label: t("expenses.tabs.list"), icon: "payments" },
    { id: "analytics" as const, label: t("expenses.tabs.analytics"), icon: "monitoring" },
    { id: "profitability" as const, label: t("expenses.tabs.profitability"), icon: "trending_up" },
    { id: "categories" as const, label: t("expenses.tabs.categories"), icon: "category" },
  ];

  const openCreate = useCallback(() => {
    setEditingExpense(null);
    setIsModalOpen(true);
  }, []);

  const openEdit = useCallback((expense: Expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setEditingExpense(null), 300);
  }, []);

  const handleFormSubmit = useCallback(
    async (data: ExpenseFormData): Promise<boolean> => {
      if (editingExpense) {
        return updateExpense(editingExpense.id, data);
      }
      return createExpense(data);
    },
    [editingExpense, createExpense, updateExpense]
  );

  const handleExportCSV = async () => {
    const report = await getReportData();
    if (!report || report.expenses.length === 0) {
      toast.warning(t("expenses.toasts.no_data_export"));
      return;
    }
    const rows = report.expenses.map((e) => ({
      [t("expenses.table.date")]: new Date(e.expenseDate).toLocaleDateString(isRtl ? "ar-DZ" : "fr-DZ"),
      [t("expenses.table.title")]: e.title,
      [t("expenses.table.category")]: e.category,
      [t("expenses.table.amount")]: e.amount,
      [t("expenses.table.payment_method")]: e.paymentMethod ?? "",
      [t("expenses.table.supplier")]: e.supplier ?? "",
      [t("expenses.form.description")]: e.description ?? "",
      [t("expenses.table.notes")]: e.notes ?? "",
    }));
    exportCSV(rows, `depenses_modadz_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportExcel = async () => {
    const report = await getReportData();
    if (!report || report.expenses.length === 0) {
      toast.warning(t("expenses.toasts.no_data_export"));
      return;
    }
    const rows = report.expenses.map((e) => ({
      [t("expenses.table.date")]: new Date(e.expenseDate).toLocaleDateString(isRtl ? "ar-DZ" : "fr-DZ"),
      [t("expenses.table.title")]: e.title,
      [t("expenses.table.category")]: e.category,
      [t("expenses.table.amount")]: e.amount,
      [t("expenses.table.payment_method")]: e.paymentMethod ?? "",
      [t("expenses.table.supplier")]: e.supplier ?? "",
      [t("expenses.form.description")]: e.description ?? "",
      [t("expenses.table.notes")]: e.notes ?? "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t("expenses.tabs.list"));
    XLSX.writeFile(workbook, `depenses_modadz_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleExportPDF = () => {
    const printStyle = document.createElement("style");
    printStyle.innerHTML = `
      @media print {
        @page {
          size: A4 portrait !important;
          margin: 15mm !important;
        }
        body * {
          visibility: hidden !important;
        }
        #expense-report, #expense-report * {
          visibility: visible !important;
        }
        #expense-report {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          background: white !important;
          color: black !important;
        }
      }
    `;
    document.head.appendChild(printStyle);
    window.print();
    document.head.removeChild(printStyle);
  };

  const isEmpty = !isLoading && expenses.length === 0 && !search && !category && !from && !to && !minAmount && !maxAmount && !supplier && !paymentMethod;

  return (
    <div
      id="expenses-page"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "var(--color-surface-container)",
      }}
    >
      {/* ── Top bar ── */}
      <div
        style={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(208,197,175,0.15)",
          padding: "0 32px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          zIndex: 50,
          flexDirection: isRtl ? "row-reverse" : "row",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <span
            className="material-symbols-outlined filled"
            style={{ fontSize: 22, color: "var(--color-primary)" }}
          >
            receipt_long
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 16,
              color: "var(--color-on-surface)",
              letterSpacing: "-0.01em",
            }}
          >
            {t("expenses.title")}
          </span>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
          {activeTab !== "categories" && (
            <div style={{ display: "flex", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
              <button className="btn-border" onClick={handleExportCSV} style={{ gap: 6, display: "flex", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>table_view</span>
                CSV
              </button>
              <button className="btn-border" onClick={handleExportExcel} style={{ gap: 6, display: "flex", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>grid_on</span>
                Excel
              </button>
              <button className="btn-border" onClick={handleExportPDF} style={{ gap: 6, display: "flex", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>picture_as_pdf</span>
                PDF
              </button>
            </div>
          )}
          {activeTab === "list" && (
            <button className="btn-primary" onClick={openCreate} style={{ gap: 6, display: "flex", alignItems: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
              {t("expenses.add_expense")}
            </button>
          )}
        </div>
      </div>

      {/* ── Sub bar for Tabs ── */}
      <div
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(208,197,175,0.15)",
          padding: "0 32px",
          height: 48,
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          position: "sticky",
          top: 64,
          zIndex: 49,
          flexDirection: isRtl ? "row-reverse" : "row",
        }}
      >
        <div style={{ display: "flex", gap: "24px", height: "100%", alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  height: "100%",
                  padding: "0 8px",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  background: "none",
                  border: "none",
                  borderBottom: `3px solid ${isActive ? "var(--color-primary)" : "transparent"}`,
                  color: isActive ? "var(--color-primary)" : "var(--color-secondary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "color 0.2s, border-color 0.2s",
                  flexDirection: isRtl ? "row-reverse" : "row",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <main
        style={{
          padding: "32px",
          maxWidth: 1480,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* ── Page Header ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 32,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 28,
                fontWeight: 700,
                color: "var(--color-on-surface)",
                letterSpacing: "-0.02em",
                marginBottom: 8,
              }}
            >
              {activeTab === "list" && t("expenses.headers.list")}
              {activeTab === "analytics" && t("expenses.headers.analytics")}
              {activeTab === "profitability" && t("expenses.headers.profitability")}
              {activeTab === "categories" && t("expenses.headers.categories")}
            </h1>
            <p
              style={{
                fontSize: "var(--text-body-md)",
                color: "var(--color-secondary)",
                lineHeight: 1.6,
                maxWidth: 520,
              }}
            >
              {activeTab === "list" && t("expenses.headers.list_desc")}
              {activeTab === "analytics" && t("expenses.headers.analytics_desc")}
              {activeTab === "profitability" && t("expenses.headers.profitability_desc")}
              {activeTab === "categories" && t("expenses.headers.categories_desc")}
            </p>
          </div>

          {/* Net profit pill */}
          {summary && activeTab !== "categories" && (
            <div
              style={{
                background:
                  summary.totalSalesMonth - summary.monthTotal >= 0
                    ? "rgba(39,104,104,0.06)"
                    : "rgba(186,26,26,0.06)",
                border:
                  summary.totalSalesMonth - summary.monthTotal >= 0
                    ? "1px solid rgba(39,104,104,0.18)"
                    : "1px solid rgba(186,26,26,0.18)",
                borderRadius: "var(--radius-xl)",
                padding: "16px 24px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "var(--radius-full)",
                  background:
                    summary.totalSalesMonth - summary.monthTotal >= 0
                      ? "rgba(39,104,104,0.1)"
                      : "rgba(186,26,26,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  className="material-symbols-outlined filled"
                  style={{
                    fontSize: 20,
                    color:
                      summary.totalSalesMonth - summary.monthTotal >= 0
                        ? "var(--color-tertiary)"
                        : "var(--color-error)",
                  }}
                >
                  {summary.totalSalesMonth - summary.monthTotal >= 0 ? "trending_up" : "trending_down"}
                </span>
              </div>
              <div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--color-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 3,
                  }}
                >
                  {t("expenses.headers.net_profit_month")}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 20,
                    color:
                      summary.totalSalesMonth - summary.monthTotal >= 0
                        ? "var(--color-tertiary)"
                        : "var(--color-error)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {formatCurrency(summary.totalSalesMonth - summary.monthTotal)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── KPI Cards ── */}
        {activeTab === "list" && (
          <ExpenseKPICards summary={summary} isLoading={isSummaryLoading} />
        )}

        {/* ── Tab Views ── */}
        {activeTab === "list" && (
          isEmpty ? (
            /* ── Empty State ── */
            <div style={{ marginTop: 40 }}>
              <EmptyState
                icon={Receipt}
                title={t("expenses.empty_state.title")}
                description={t("expenses.empty_state.desc")}
                action={
                  <button className="btn-primary" onClick={openCreate} style={{ gap: 6 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                    {t("expenses.empty_state.add_btn")}
                  </button>
                }
              />
            </div>
          ) : (
            /* ── Content grid (main + sidebar) ── */
            <div
              className={`grid grid-cols-1 ${isRtl ? "xl:grid-cols-[320px_1fr]" : "xl:grid-cols-[1fr_320px]"} gap-6 items-start`}
            >
              {/* Main column */}
              <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
                {/* Filters */}
                <ExpenseFilters
                  search={search}
                  category={category}
                  supplier={supplier}
                  paymentMethod={paymentMethod}
                  from={from}
                  to={to}
                  minAmount={minAmount}
                  maxAmount={maxAmount}
                  sort={sort}
                  categories={categories}
                  paymentMethods={EXPENSE_PAYMENT_METHODS}
                  onSearch={handleSearch}
                  onCategory={handleCategory}
                  onSupplier={handleSupplier}
                  onPaymentMethod={handlePaymentMethod}
                  onDateRange={handleDateRange}
                  onAmountRange={handleAmountRange}
                  onSort={handleSort}
                  onReset={resetFilters}
                  total={total}
                />
 
                {/* Table */}
                <ExpenseTable
                  expenses={expenses}
                  isLoading={isLoading}
                  total={total}
                  page={page}
                  pageSize={pageSize}
                  onEdit={openEdit}
                  onDelete={deleteExpense}
                  onPageChange={handlePageChange}
                />
              </div>
 
              {/* Sidebar */}
              <div style={{ position: "sticky", top: 128 }}>
                <ExpenseCategorySidebar
                  expenses={expenses}
                  isLoading={isLoading}
                  onManageCategories={() => setActiveTab("categories")}
                />
              </div>
            </div>
          )
        )}

        {activeTab === "analytics" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Charts Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <ExpenseCharts analytics={analytics} isLoading={isAnalyticsLoading} />
            </div>

            {/* Insights & Alerts Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Business Insights */}
              <div className="glass-card" style={{ borderRadius: "var(--radius-xl)", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <h3 style={{ fontSize: "var(--text-label-md)", fontWeight: "var(--fw-label-md)", letterSpacing: "var(--ls-label-md)", color: "var(--color-secondary)", textTransform: "uppercase" }}>
                  {t("expenses.analytics.insights_title")}
                </h3>
                {analytics?.insights && analytics.insights.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {analytics.insights.map((insight, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "var(--color-on-surface)", background: "var(--color-surface-container-low)", padding: 14, borderRadius: "var(--radius-lg)" }}>
                        <span className="material-symbols-outlined" style={{ color: "var(--color-primary)" }}>info</span>
                        <span>{insight}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)", fontStyle: "italic" }}>
                    {t("expenses.analytics.no_insights")}
                  </p>
                )}
              </div>

              {/* Alerts */}
              <div className="glass-card" style={{ borderRadius: "var(--radius-xl)", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <h3 style={{ fontSize: "var(--text-label-md)", fontWeight: "var(--fw-label-md)", letterSpacing: "var(--ls-label-md)", color: "var(--color-secondary)", textTransform: "uppercase" }}>
                  {t("expenses.analytics.alerts_title")}
                </h3>
                {analytics?.alerts && analytics.alerts.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {analytics.alerts.map((alert, idx) => {
                      const severityBg = alert.severity === "danger"
                        ? "rgba(186,26,26,0.06)"
                        : alert.severity === "warning"
                          ? "rgba(212,175,55,0.08)"
                          : "rgba(2,132,199,0.08)";
                      const severityBorder = alert.severity === "danger"
                        ? "1px solid rgba(186,26,26,0.18)"
                        : alert.severity === "warning"
                          ? "1px solid rgba(212,175,55,0.2)"
                          : "1px solid rgba(2,132,199,0.2)";
                      const severityColor = alert.severity === "danger"
                        ? "var(--color-error)"
                        : alert.severity === "warning"
                          ? "var(--color-primary)"
                          : "var(--color-info)";

                      return (
                        <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: severityBg, border: severityBorder, borderInlineStart: `4px solid ${severityColor}`, padding: 14, borderRadius: "var(--radius-lg)" }}>
                          <span className="material-symbols-outlined" style={{ color: severityColor }}>warning</span>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--color-on-surface)", marginBottom: 2 }}>{alert.title}</p>
                            <p style={{ fontSize: 12, color: "var(--color-secondary)" }}>{alert.message}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: "var(--radius-lg)", background: "rgba(39,104,104,0.08)" }}>
                    <span className="material-symbols-outlined" style={{ color: "var(--color-tertiary)" }}>check_circle</span>
                    <p style={{ fontSize: 13, color: "var(--color-tertiary)" }}>{t("expenses.analytics.no_alerts")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "profitability" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {/* KPI Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
              {/* Total Revenue */}
              <div className="glass-card animate-fade-in" style={{ borderRadius: "var(--radius-xl)", padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: "var(--radius-lg)", background: "rgba(39,104,104,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="material-symbols-outlined filled" style={{ fontSize: 22, color: "var(--color-tertiary)" }}>payments</span>
                </div>
                <div>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--color-on-surface)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                    {analytics?.profitability ? formatCurrency(analytics.profitability.revenue) : "—"}
                  </p>
                  <p style={{ fontSize: "var(--text-label-sm)", letterSpacing: "var(--ls-label-sm)", fontWeight: "var(--fw-label-sm)", color: "var(--color-secondary)", textTransform: "uppercase", marginTop: 4 }}>
                    {t("expenses.analytics.total_revenue")}
                  </p>
                </div>
              </div>

              {/* Total Expenses */}
              <div className="glass-card animate-fade-in" style={{ borderRadius: "var(--radius-xl)", padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: "var(--radius-lg)", background: "rgba(186,26,26,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="material-symbols-outlined filled" style={{ fontSize: 22, color: "var(--color-error)" }}>receipt_long</span>
                </div>
                <div>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--color-on-surface)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                    {analytics?.profitability ? formatCurrency(analytics.profitability.expenses) : "—"}
                  </p>
                  <p style={{ fontSize: "var(--text-label-sm)", letterSpacing: "var(--ls-label-sm)", fontWeight: "var(--fw-label-sm)", color: "var(--color-secondary)", textTransform: "uppercase", marginTop: 4 }}>
                    {t("expenses.analytics.total_expenses")}
                  </p>
                </div>
              </div>

              {/* Net Profit */}
              {(() => {
                const profit = analytics?.profitability?.netProfit ?? 0;
                const isPositive = profit >= 0;
                return (
                  <div className="glass-card animate-fade-in" style={{ borderRadius: "var(--radius-xl)", padding: 28, display: "flex", flexDirection: "column", gap: 16, background: isPositive ? "rgba(39,104,104,0.04)" : "rgba(186,26,26,0.04)", border: isPositive ? "1px solid rgba(39,104,104,0.15)" : "1px solid rgba(186,26,26,0.15)" }}>
                    <div style={{ width: 44, height: 44, borderRadius: "var(--radius-lg)", background: isPositive ? "rgba(39,104,104,0.12)" : "rgba(186,26,26,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span className="material-symbols-outlined filled" style={{ fontSize: 22, color: isPositive ? "var(--color-tertiary)" : "var(--color-error)" }}>
                        {isPositive ? "trending_up" : "trending_down"}
                      </span>
                    </div>
                    <div>
                      <p style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: isPositive ? "var(--color-tertiary)" : "var(--color-error)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                        {analytics?.profitability ? formatCurrency(profit) : "—"}
                      </p>
                      <p style={{ fontSize: "var(--text-label-sm)", letterSpacing: "var(--ls-label-sm)", fontWeight: "var(--fw-label-sm)", color: "var(--color-secondary)", textTransform: "uppercase", marginTop: 4 }}>
                        {t("expenses.analytics.net_profit")}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Profit Margin */}
              <div className="glass-card animate-fade-in" style={{ borderRadius: "var(--radius-xl)", padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: "var(--radius-lg)", background: "rgba(212,175,55,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="material-symbols-outlined filled" style={{ fontSize: 22, color: "var(--color-primary)" }}>percent</span>
                </div>
                <div>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--color-on-surface)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                    {analytics?.profitability ? `${analytics.profitability.marginPct}%` : "—"}
                  </p>
                  <p style={{ fontSize: "var(--text-label-sm)", letterSpacing: "var(--ls-label-sm)", fontWeight: "var(--fw-label-sm)", color: "var(--color-secondary)", textTransform: "uppercase", marginTop: 4 }}>
                    {t("expenses.analytics.profit_margin")}
                  </p>
                </div>
              </div>
            </div>

            {/* Profitability Rating Card */}
            {analytics?.profitability && (
              <div className="glass-card" style={{ borderRadius: "var(--radius-xl)", padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--color-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {t("expenses.analytics.perf_eval")}
                </p>

                {analytics.profitability.status === "excellent" && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--color-tertiary)" }}>verified</span>
                    <span style={{ fontSize: 22, fontWeight: 700, color: "var(--color-tertiary)" }}>
                      🟢 {t("expenses.analytics.rating.excellent")}
                    </span>
                    <p style={{ fontSize: 14, color: "var(--color-secondary)", maxWidth: 480, lineHeight: 1.6 }}>
                      {t("expenses.analytics.rating.excellent_desc")}
                    </p>
                  </div>
                )}

                {analytics.profitability.status === "moderate" && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--color-primary)" }}>hourglass_empty</span>
                    <span style={{ fontSize: 22, fontWeight: 700, color: "var(--color-primary)" }}>
                      🟡 {t("expenses.analytics.rating.moderate")}
                    </span>
                    <p style={{ fontSize: 14, color: "var(--color-secondary)", maxWidth: 480, lineHeight: 1.6 }}>
                      {t("expenses.analytics.rating.moderate_desc")}
                    </p>
                  </div>
                )}

                {analytics.profitability.status === "low" && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--color-error)" }}>warning</span>
                    <span style={{ fontSize: 22, fontWeight: 700, color: "var(--color-error)" }}>
                      🔴 {t("expenses.analytics.rating.low")}
                    </span>
                    <p style={{ fontSize: 14, color: "var(--color-error)", maxWidth: 480, lineHeight: 1.6 }}>
                      {t("expenses.analytics.rating.low_desc")}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "categories" && (
          <div style={{ margin: "0 auto", width: "100%" }}>
            <ExpenseCategoryManager
              categories={categories}
              isLoading={isCategoriesLoading}
              onCreate={createCategory}
              onUpdate={updateCategory}
              onArchive={archiveCategory}
              onDelete={deleteCategory}
            />
          </div>
        )}
      </main>

      {/* ── Form Modal ── */}
      <ExpenseFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
        expense={editingExpense}
        categories={categories}
      />

      {/* ── Printable Report (Invisible except in print) ── */}
      <ExpenseReportPrint
        storeName={settings?.storeName}
        storePhone={settings?.storePhone}
        storeAddress={settings?.storeAddress}
        rangeLabel={from && to ? (isRtl ? `من ${new Date(from).toLocaleDateString("ar-DZ")} إلى ${new Date(to).toLocaleDateString("ar-DZ")}` : `Du ${new Date(from).toLocaleDateString("fr-DZ")} au ${new Date(to).toLocaleDateString("fr-DZ")}`) : t("expenses.report.all_periods")}
        expenses={expenses}
        totalExpenses={analytics?.profitability?.expenses ?? 0}
        analytics={analytics}
        profitability={analytics?.profitability ?? null}
      />

      {/* ── Responsive styles ── */}
      <style>{`
        @media (max-width: 1100px) {
          #expenses-page main > div:last-of-type {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          #expenses-page main {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
