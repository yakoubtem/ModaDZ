import type { Expense, ExpenseAnalytics, ProfitabilitySummary } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ExpenseCharts } from "./ExpenseCharts";

interface ExpenseReportPrintProps {
  storeName?: string;
  storePhone?: string;
  storeAddress?: string;
  rangeLabel: string;
  expenses: Expense[];
  totalExpenses: number;
  analytics: ExpenseAnalytics | null;
  profitability: ProfitabilitySummary | null;
}

export function ExpenseReportPrint({
  storeName,
  storePhone,
  storeAddress,
  rangeLabel,
  expenses,
  totalExpenses,
  analytics,
  profitability,
}: ExpenseReportPrintProps) {
  return (
    <section id="expense-report" className="print-only">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Rapport des depenses</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">Periode: {rangeLabel}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold">{storeName || "ModaDZ"}</p>
            {storePhone && <p>{storePhone}</p>}
            {storeAddress && <p>{storeAddress}</p>}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] p-3">
            <p className="text-xs text-[var(--color-text-secondary)] uppercase">Total depenses</p>
            <p className="text-lg font-bold">{formatCurrency(totalExpenses)}</p>
          </div>
          <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] p-3">
            <p className="text-xs text-[var(--color-text-secondary)] uppercase">Revenu</p>
            <p className="text-lg font-bold">{formatCurrency(profitability?.revenue ?? 0)}</p>
          </div>
          <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] p-3">
            <p className="text-xs text-[var(--color-text-secondary)] uppercase">Benefice net</p>
            <p className="text-lg font-bold">{formatCurrency(profitability?.netProfit ?? 0)}</p>
          </div>
          <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] p-3">
            <p className="text-xs text-[var(--color-text-secondary)] uppercase">Marge</p>
            <p className="text-lg font-bold">{profitability?.marginPct ?? 0}%</p>
          </div>
        </div>

        {analytics && (
          <div className="grid grid-cols-2 gap-4">
            <ExpenseCharts analytics={analytics} isLoading={false} />
          </div>
        )}

        <div className="border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
          <table className="table-base">
            <thead>
              <tr>
                <th>Date</th>
                <th>Titre</th>
                <th>Categorie</th>
                <th>Fournisseur</th>
                <th style={{ textAlign: "right" }}>Montant</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id}>
                  <td>{formatDate(exp.expenseDate)}</td>
                  <td>{exp.title}</td>
                  <td>{exp.category}</td>
                  <td>{exp.supplier || "-"}</td>
                  <td style={{ textAlign: "right" }}>{formatCurrency(exp.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
