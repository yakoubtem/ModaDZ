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
      <>
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="flex-1 w-full" />
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
            background: "var(--color-primary)",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        Évolution du chiffre d'affaires
      </h3>
      <div style={{ minWidth: 0, width: "100%", height: 320 }}>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" vertical={false} strokeOpacity={0.65} />
            <XAxis
              dataKey="date"
              tickFormatter={(val) => {
                const d = new Date(val);
                return d.toLocaleDateString("fr-DZ", { day: "2-digit", month: "short" });
              }}
              stroke="var(--color-secondary)"
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
              stroke="var(--color-secondary)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-surface-container-lowest)",
                borderColor: "var(--color-border)",
                borderRadius: "10px",
                color: "var(--color-on-surface)",
                boxShadow: "var(--shadow-card)",
                fontSize: "12px",
                padding: "8px 12px",
              }}
              labelFormatter={(label) => formatDate(label)}
              formatter={(value: any) => [formatCurrency(Number(value ?? 0)), "Revenu"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-primary)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              activeDot={{ r: 5, fill: "var(--color-primary)", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}