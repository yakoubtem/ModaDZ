import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import type { ExpenseAnalytics } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTranslation } from "@/hooks/useTranslation";

interface ExpenseChartsProps {
  analytics: ExpenseAnalytics | null;
  isLoading: boolean;
}

const CATEGORY_COLORS = [
  "#735c00",
  "#276868",
  "#f59e0b",
  "#d4af37",
  "#0284c7",
  "#b45309",
  "#4d8b8b",
  "#7f7663",
];

export function ExpenseCharts({ analytics, isLoading }: ExpenseChartsProps) {
  const { t } = useTranslation();

  if (isLoading || !analytics) {
    return (
      <>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card rounded-[var(--radius-xl)] p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-60 w-full" />
          </div>
        ))}
      </>
    );
  }

  const categoryData = analytics.expensesByCategory.map((c, i) => ({
    name: c.label,
    value: c.value,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  return (
    <>
      {/* Monthly Expenses Trend */}
      <div className="glass-card rounded-[var(--radius-xl)] p-6">
        <h3 className="text-[var(--text-label-md)] font-[var(--fw-label-md)] tracking-[var(--ls-label-md)] text-[var(--color-secondary)] mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--color-primary-container)]" />
          {t("expenses.analytics.trend_title")}
        </h3>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height={256}>
            <LineChart data={analytics.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "var(--color-secondary)", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fill: "var(--color-secondary)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "var(--color-outline-variant)",
                  borderRadius: "10px",
                  color: "var(--color-on-surface)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: "12px",
                }}
                formatter={(value: unknown) => {
                  const n = typeof value === "number" ? value : Number(value ?? 0);
                  return [formatCurrency(n), t("expenses.analytics.expenses_label")];
                }}
              />
              <Line type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expenses by Category */}
      <div className="glass-card rounded-[var(--radius-xl)] p-6">
        <h3 className="text-[var(--text-label-md)] font-[var(--fw-label-md)] tracking-[var(--ls-label-md)] text-[var(--color-secondary)] mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--color-warning)]" />
          {t("expenses.analytics.category_title")}
        </h3>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height={256}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "var(--color-outline-variant)",
                  borderRadius: "10px",
                  color: "var(--color-on-surface)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: "12px",
                }}
                formatter={(value: unknown) => {
                  const n = typeof value === "number" ? value : Number(value ?? 0);
                  return [formatCurrency(n), t("expenses.table.amount")];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue vs Expenses */}
      <div className="glass-card rounded-[var(--radius-xl)] p-6">
        <h3 className="text-[var(--text-label-md)] font-[var(--fw-label-md)] tracking-[var(--ls-label-md)] text-[var(--color-secondary)] mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--color-tertiary)]" />
          {t("expenses.analytics.rev_vs_exp_title")}
        </h3>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height={256}>
            <BarChart data={analytics.revenueVsExpenses} barSize={26}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "var(--color-secondary)", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fill: "var(--color-secondary)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "var(--color-outline-variant)",
                  borderRadius: "10px",
                  color: "var(--color-on-surface)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: "12px",
                }}
                formatter={(value: any, name: any) => {
                  const n = typeof value === "number" ? value : Number(value ?? 0);
                  return [formatCurrency(n), name === "revenue" ? t("expenses.analytics.revenue_label") : t("expenses.analytics.expenses_label")];
                }}
              />
              <Bar dataKey="revenue" fill="var(--color-primary-container)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expenses" fill="var(--color-error)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Net Profit Evolution */}
      <div className="glass-card rounded-[var(--radius-xl)] p-6">
        <h3 className="text-[var(--text-label-md)] font-[var(--fw-label-md)] tracking-[var(--ls-label-md)] text-[var(--color-secondary)] mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--color-tertiary-container)]" />
          {t("expenses.analytics.net_profit_title")}
        </h3>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height={256}>
            <AreaChart data={analytics.netProfitEvolution}>
              <defs>
                <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-tertiary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-tertiary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "var(--color-secondary)", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fill: "var(--color-secondary)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "var(--color-outline-variant)",
                  borderRadius: "10px",
                  color: "var(--color-on-surface)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: "12px",
                }}
                formatter={(value: unknown) => {
                  const n = typeof value === "number" ? value : Number(value ?? 0);
                  return [formatCurrency(n), t("expenses.analytics.net_profit_label")];
                }}
              />
              <Area type="monotone" dataKey="profit" stroke="var(--color-tertiary)" strokeWidth={3} fill="url(#profitFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
