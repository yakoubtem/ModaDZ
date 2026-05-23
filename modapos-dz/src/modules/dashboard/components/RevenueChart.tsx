import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { RevenueDataPoint } from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";

interface RevenueChartProps {
  data?: RevenueDataPoint[];
  isLoading: boolean;
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  if (isLoading || !data) {
    return (
    <div className="bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] h-[360px] flex flex-col gap-5 shadow-[var(--shadow-sm)]">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="flex-1 w-full" />
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] h-[360px] flex flex-col shadow-[var(--shadow-sm)]">
      <h3 className="text-sm font-bold text-[var(--color-text-primary)] tracking-wide flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] inline-block" />
        Évolution du chiffre d'affaires (30 derniers jours)
      </h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} strokeOpacity={0.65} />
            <XAxis
              dataKey="date"
              tickFormatter={(val) => {
                const d = new Date(val);
                return d.toLocaleDateString("fr-DZ", { day: "2-digit", month: "short" });
              }}
              stroke="var(--color-text-muted)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis
              tickFormatter={(val) =>
                new Intl.NumberFormat("fr-DZ", {
                  notation: "compact",
                  compactDisplay: "short",
                }).format(val)
              }
              stroke="var(--color-text-muted)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderColor: "var(--color-border)",
                borderRadius: "10px",
                color: "var(--color-text-primary)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                fontSize: "12px",
                padding: "8px 12px",
              }}
              labelFormatter={(label) => formatDate(label)}
              formatter={(value: any) => [formatCurrency(Number(value ?? 0)), "Revenu"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-accent)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}