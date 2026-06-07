import type { Expense, ExpenseAnalytics, ProfitabilitySummary } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ExpenseCharts } from "./ExpenseCharts";
import { useTranslation } from "@/hooks/useTranslation";

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
  const { t, isRtl } = useTranslation();

  return (
    <section id="expense-report" className="print-only" dir={isRtl ? "rtl" : "ltr"}>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("expenses.report.title")}</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">{t("expenses.report.period", { period: rangeLabel })}</p>
          </div>
          <div className={`text-sm ${isRtl ? "text-left" : "text-right"}`}>
            <p className="font-semibold">{storeName || "ModaDZ"}</p>
            {storePhone && <p>{storePhone}</p>}
            {storeAddress && <p>{storeAddress}</p>}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] p-3">
            <p className="text-xs text-[var(--color-text-secondary)] uppercase">{t("expenses.report.total_expenses")}</p>
            <p className="text-lg font-bold">{formatCurrency(totalExpenses)}</p>
          </div>
          <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] p-3">
            <p className="text-xs text-[var(--color-text-secondary)] uppercase">{t("expenses.report.revenue")}</p>
            <p className="text-lg font-bold">{formatCurrency(profitability?.revenue ?? 0)}</p>
          </div>
          <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] p-3">
            <p className="text-xs text-[var(--color-text-secondary)] uppercase">{t("expenses.report.net_profit")}</p>
            <p className="text-lg font-bold">{formatCurrency(profitability?.netProfit ?? 0)}</p>
          </div>
          <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] p-3">
            <p className="text-xs text-[var(--color-text-secondary)] uppercase">{t("expenses.report.margin")}</p>
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
                <th>{t("expenses.table.date")}</th>
                <th>{t("expenses.table.title")}</th>
                <th>{t("expenses.table.category")}</th>
                <th>{t("expenses.table.supplier")}</th>
                <th style={{ textAlign: isRtl ? "left" : "right" }}>{t("expenses.table.amount")}</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id}>
                  <td>{formatDate(exp.expenseDate)}</td>
                  <td>{exp.title}</td>
                  <td>{exp.category}</td>
                  <td>{exp.supplier || "-"}</td>
                  <td style={{ textAlign: isRtl ? "left" : "right" }}>{formatCurrency(exp.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
