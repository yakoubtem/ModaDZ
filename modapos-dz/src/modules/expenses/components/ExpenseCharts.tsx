import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { Expense } from "@/types";
import { formatCurrency } from "@/lib/utils";

// ─── Colors for categories ────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  Loyer: "#735c00",
  Salaires: "#276868",
  Transport: "#f59e0b",
  Marketing: "#d4af37",
  Internet: "#0284c7",
  "Électricité": "#b45309",
  Eau: "#4d8b8b",
  Maintenance: "#7f7663",
  Achats: "#554300",
  Fournisseurs: "#93d2d1",
  Taxes: "#ba1a1a",
  Autres: "#5f5e5e",
};

function getColor(category: string, index: number): string {
  return CATEGORY_COLORS[category] || [
    "#735c00", "#276868", "#f59e0b", "#d4af37",
    "#0284c7", "#b45309", "#4d8b8b", "#7f7663",
  ][index % 8];
}

// ─── Distribution Pie Chart ──────────────────────────────

interface DistributionChartProps {
  expenses: Expense[];
  isLoading: boolean;
}

export function ExpenseDistributionChart({ expenses, isLoading }: DistributionChartProps) {
  const data = useMemo(() => {
    const map = new Map<string, number>();
    for (const exp of expenses) {
      map.set(exp.category, (map.get(exp.category) ?? 0) + exp.amount);
    }
    return Array.from(map.entries())
      .map(([name, value], i) => ({
        name,
        value: Math.round(value),
        color: getColor(name, i),
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const hasData = data.length > 0 && data.reduce((s, d) => s + d.value, 0) > 0;

  if (isLoading) {
    return (
      <>
        <div className="skeleton" style={{ height: 20, width: "60%", borderRadius: 8, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 220, borderRadius: 12 }} />
      </>
    );
  }

  return (
    <>
      <h3
        style={{
          fontSize: "var(--text-label-md)",
          fontWeight: "var(--fw-label-md)",
          letterSpacing: "var(--ls-label-md)",
          color: "var(--color-secondary)",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--color-primary-container)",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        Répartition par catégorie
      </h3>
      <div style={{ minWidth: 0, width: "100%", height: 240, position: "relative" }}>
        {hasData ? (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
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
                  return [formatCurrency(n), "Total"];
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ paddingTop: 6, fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-secondary)",
              fontSize: 14,
              fontStyle: "italic",
            }}
          >
            Aucune dépense enregistrée
          </div>
        )}
      </div>
    </>
  );
}

// ─── Monthly Bar Chart ───────────────────────────────────

interface MonthlyChartProps {
  expenses: Expense[];
  isLoading: boolean;
}

export function ExpensesByMonthChart({ expenses, isLoading }: MonthlyChartProps) {
  const data = useMemo(() => {
    const map = new Map<string, number>();
    for (const exp of expenses) {
      const d = new Date(exp.expenseDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, (map.get(key) ?? 0) + exp.amount);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, amount]) => {
        const [y, m] = month.split("-");
        const label = new Date(Number(y), Number(m) - 1).toLocaleDateString("fr-DZ", {
          month: "short",
          year: "2-digit",
        });
        return { month: label, amount: Math.round(amount) };
      });
  }, [expenses]);

  if (isLoading) {
    return (
      <>
        <div className="skeleton" style={{ height: 20, width: "60%", borderRadius: 8, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 220, borderRadius: 12 }} />
      </>
    );
  }

  return (
    <>
      <h3
        style={{
          fontSize: "var(--text-label-md)",
          fontWeight: "var(--fw-label-md)",
          letterSpacing: "var(--ls-label-md)",
          color: "var(--color-secondary)",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--color-tertiary)",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        Dépenses par mois
      </h3>
      <div style={{ minWidth: 0, width: "100%", height: 240, position: "relative" }}>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(208,197,175,0.3)" />
              <XAxis
                dataKey="month"
                tick={{ fill: "var(--color-secondary)", fontSize: 11 }}
                axisLine={{ stroke: "rgba(208,197,175,0.3)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--color-secondary)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${Math.round(v / 1000)}k`}
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
                  return [formatCurrency(n), "Dépenses"];
                }}
              />
              <Bar dataKey="amount" fill="var(--color-primary-container)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-secondary)",
              fontSize: 14,
              fontStyle: "italic",
            }}
          >
            Aucune donnée disponible
          </div>
        )}
      </div>
    </>
  );
}
