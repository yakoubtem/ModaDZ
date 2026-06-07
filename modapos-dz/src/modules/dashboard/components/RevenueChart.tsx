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
import { useTranslation } from "@/hooks/useTranslation";

interface RevenueChartProps {
  data?: RevenueDataPoint[];
  isLoading: boolean;
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  const { t, isRtl } = useTranslation();
  const getLang = () => (typeof document !== "undefined" ? document.documentElement.lang : "fr") || "fr";

  if (isLoading || !data) {
    return (
      <>
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="flex-1 w-full" />
      </>
    );
  }

  const chartLang = getLang() === "ar" ? "ar-DZ" : "fr-DZ";

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
          flexDirection: isRtl ? "row-reverse" : "row",
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
        {t("dashboard.revenue_chart")}
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
                return d.toLocaleDateString(chartLang, { day: "2-digit", month: "short" });
              }}
              stroke="var(--color-secondary)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis
              tickFormatter={(val) =>
                new Intl.NumberFormat(chartLang, {
                  notation: "compact",
                  compactDisplay: "short",
                }).format(val)
              }
              stroke="var(--color-secondary)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              orientation={isRtl ? "right" : "left"}
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
                textAlign: isRtl ? "right" : "left",
              }}
              labelFormatter={(label) => formatDate(label)}
              formatter={(value: any) => [formatCurrency(Number(value ?? 0)), t("dashboard.kpis.revenue_today")]}
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