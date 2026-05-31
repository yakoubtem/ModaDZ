import { useState, useCallback } from "react";
import { Receipt } from "lucide-react";
import { useExpenses } from "./hooks/useExpenses";
import { ExpenseKPICards } from "./components/ExpenseKPICards";
import { ExpenseFilters } from "./components/ExpenseFilters";
import { ExpenseTable } from "./components/ExpenseTable";
import { ExpenseFormModal } from "./components/ExpenseFormModal";
import { ExpenseDistributionChart, ExpensesByMonthChart } from "./components/ExpenseCharts";
import { ExpenseCategorySidebar } from "./components/ExpenseCategorySidebar";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";
import type { Expense, ExpenseFormData } from "@/types";

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

export function ExpensesPage() {
  const {
    expenses,
    summary,
    total,
    page,
    pageSize,
    isLoading,
    isSummaryLoading,
    search,
    category,
    from,
    to,
    minAmount,
    maxAmount,
    sort,
    handleSearch,
    handleCategory,
    handleDateRange,
    handleAmountRange,
    handleSort,
    handlePageChange,
    resetFilters,
    createExpense,
    updateExpense,
    deleteExpense,
  } = useExpenses();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

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

  const handleExportCSV = () => {
    const rows = expenses.map((e) => ({
      Date: new Date(e.expenseDate).toLocaleDateString("fr-DZ"),
      Titre: e.title,
      Catégorie: e.category,
      Montant: e.amount,
      Paiement: e.paymentMethod ?? "",
      Description: e.description ?? "",
    }));
    exportCSV(rows, `depenses_modadz_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportPDF = () => window.print();

  const isEmpty = !isLoading && expenses.length === 0 && !search && !category && !from && !to && !minAmount && !maxAmount;

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
          borderBottom: "1px solid rgba(208,197,175,0.2)",
          padding: "0 32px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
            Gestion des Dépenses
          </span>
          {total > 0 && (
            <span
              style={{
                padding: "2px 9px",
                borderRadius: "var(--radius-full)",
                background: "rgba(212,175,55,0.12)",
                color: "var(--color-primary)",
                fontSize: 11,
                fontWeight: 700,
                border: "1px solid rgba(212,175,55,0.25)",
              }}
            >
              {total} dépense{total !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="btn-border" onClick={handleExportCSV} style={{ gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>table_view</span>
            CSV
          </button>
          <button className="btn-border" onClick={handleExportPDF} style={{ gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>picture_as_pdf</span>
            PDF
          </button>
          <button className="btn-primary" onClick={openCreate} style={{ gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            Nouvelle dépense
          </button>
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
              Gestion des dépenses
            </h1>
            <p
              style={{
                fontSize: "var(--text-body-md)",
                color: "var(--color-secondary)",
                lineHeight: 1.6,
                maxWidth: 520,
              }}
            >
              Suivez toutes les dépenses de votre activité et analysez votre rentabilité.
            </p>
          </div>

          {/* Net profit pill */}
          {summary && (
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
                  Profit net du mois
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
        <ExpenseKPICards summary={summary} isLoading={isSummaryLoading} />

        {isEmpty ? (
          /* ── Empty State ── */
          <div style={{ marginTop: 40 }}>
            <EmptyState
              icon={Receipt}
              title="Aucune dépense enregistrée"
              description="Commencez à suivre vos dépenses pour mieux gérer la rentabilité de votre activité."
              action={
                <button className="btn-primary" onClick={openCreate} style={{ gap: 6 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                  Ajouter une dépense
                </button>
              }
            />
          </div>
        ) : (
          /* ── Content grid (main + sidebar) ── */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 320px",
              gap: 24,
              alignItems: "start",
            }}
          >
            {/* Main column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
              {/* Filters */}
              <ExpenseFilters
                search={search}
                category={category}
                from={from}
                to={to}
                minAmount={minAmount}
                maxAmount={maxAmount}
                sort={sort}
                onSearch={handleSearch}
                onCategory={handleCategory}
                onDateRange={handleDateRange}
                onAmountRange={handleAmountRange}
                onSort={handleSort}
                onReset={resetFilters}
                total={total}
              />

              {/* Charts */}
              {expenses.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div
                    className="glass-card"
                    style={{
                      borderRadius: "var(--radius-xl)",
                      padding: 24,
                      minHeight: 320,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <ExpenseDistributionChart expenses={expenses} isLoading={isLoading} />
                  </div>
                  <div
                    className="glass-card"
                    style={{
                      borderRadius: "var(--radius-xl)",
                      padding: 24,
                      minHeight: 320,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <ExpensesByMonthChart expenses={expenses} isLoading={isLoading} />
                  </div>
                </div>
              )}

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

            {/* Right sidebar */}
            <div style={{ position: "sticky", top: 96 }}>
              <ExpenseCategorySidebar expenses={expenses} isLoading={isLoading} />
            </div>
          </div>
        )}
      </main>

      {/* ── Form Modal ── */}
      <ExpenseFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
        expense={editingExpense}
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
