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
      <div className="bg-[var(--color-bg-elevated)] p-5 rounded-lg border border-[var(--color-border)] h-[350px] flex flex-col gap-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="flex-1 w-full" />
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-elevated)] p-5 rounded-lg border border-[var(--color-border)] h-[350px] flex flex-col">
      <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">
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
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
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
                backgroundColor: "var(--color-bg-elevated)",
                borderColor: "var(--color-border)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-text-primary)",
              }}
              labelFormatter={(label) => formatDate(label)}
              formatter={(value: number) => [formatCurrency(value), "Revenu"]}
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