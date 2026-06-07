import { formatCurrency } from "@/lib/utils";
import type { ExpenseSummary } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

interface KPICardProps {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  trend?: number;
  trendLabel?: string;
  iconColor?: string;
  iconBg?: string;
  isLoading?: boolean;
  accent?: boolean;
}

function KPICard({ icon, label, value, sub, trend, trendLabel, iconColor, iconBg, isLoading, accent }: KPICardProps) {
  const trendDir = (trend ?? 0) >= 0 ? "up" : "down";
  return (
    <div
      style={{
        background: accent ? "rgba(39,104,104,0.04)" : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: accent
          ? "1px solid rgba(39,104,104,0.15)"
          : "1px solid rgba(208,197,175,0.3)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-card)",
        padding: "28px",
        display: "flex",
        flexDirection: "column" as const,
        gap: 20,
        minHeight: 148,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "var(--radius-lg)",
          background: iconBg ?? "rgba(212,175,55,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          className="material-symbols-outlined filled"
          style={{ fontSize: 22, color: iconColor ?? "var(--color-primary)" }}
        >
          {icon}
        </span>
      </div>

      {/* Value + Label */}
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 4 }}>
        {isLoading ? (
          <>
            <div
              className="skeleton"
              style={{ height: 32, width: "75%", borderRadius: "var(--radius-md)", marginBottom: 6 }}
            />
            <div className="skeleton" style={{ height: 13, width: "50%", borderRadius: "var(--radius-sm)" }} />
          </>
        ) : (
          <>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 28,
                fontWeight: 700,
                color: "var(--color-on-surface)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {value}
            </p>
            <p
              style={{
                fontSize: "var(--text-label-sm)",
                letterSpacing: "var(--ls-label-sm)",
                fontWeight: "var(--fw-label-sm)",
                color: "var(--color-secondary)",
                textTransform: "uppercase" as const,
              }}
            >
              {label}
            </p>
            {sub && (
              <p style={{ fontSize: 12, color: "var(--color-secondary)", marginTop: 2 }}>
                {sub}
              </p>
            )}
            {trend !== undefined && trendLabel && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                    fontWeight: 700,
                    color: trendDir === "up" ? "var(--color-tertiary)" : "var(--color-error)",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                    {trendDir === "up" ? "trending_up" : "trending_down"}
                  </span>
                  {Math.abs(trend)}%
                </span>
                <span style={{ fontSize: 12, color: "var(--color-secondary)" }}>{trendLabel}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface ExpenseKPICardsProps {
  summary: ExpenseSummary | null;
  isLoading: boolean;
}

export function ExpenseKPICards({ summary, isLoading }: ExpenseKPICardsProps) {
  const { t } = useTranslation();
  const netProfit = summary ? summary.totalSalesMonth - summary.monthTotal : 0;
  const isPositive = netProfit >= 0;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 20,
        marginBottom: 32,
      }}
    >
      <KPICard
        icon="payments"
        label={t("expenses.kpis.month_total")}
        value={summary ? formatCurrency(summary.monthTotal) : "—"}
        trend={summary?.monthChangePct}
        trendLabel={t("expenses.kpis.vs_last_month")}
        iconBg="rgba(186,26,26,0.1)"
        iconColor="var(--color-error)"
        isLoading={isLoading}
      />
      <KPICard
        icon="today"
        label={t("expenses.kpis.today_total")}
        value={summary ? formatCurrency(summary.todayTotal) : "—"}
        trend={summary?.todayChangePct}
        trendLabel={t("expenses.kpis.vs_yesterday")}
        iconBg="rgba(212,175,55,0.15)"
        iconColor="var(--color-primary)"
        isLoading={isLoading}
      />
      <KPICard
        icon="calendar_view_week"
        label={t("expenses.kpis.week_total")}
        value={summary ? formatCurrency(summary.weekTotal) : "—"}
        trend={summary?.weekChangePct}
        trendLabel={t("expenses.kpis.vs_last_week")}
        iconBg="rgba(2,132,199,0.12)"
        iconColor="var(--color-info)"
        isLoading={isLoading}
      />
      <KPICard
        icon="calendar_month"
        label={t("expenses.kpis.year_total")}
        value={summary ? formatCurrency(summary.yearTotal) : "—"}
        trend={summary?.yearChangePct}
        trendLabel={t("expenses.kpis.vs_last_year")}
        iconBg="rgba(39,104,104,0.1)"
        iconColor="var(--color-tertiary)"
        isLoading={isLoading}
      />
      <KPICard
        icon="category"
        label={t("expenses.kpis.top_category")}
        value={summary?.topCategory?.name ?? "—"}
        sub={summary?.topCategory ? `${formatCurrency(summary.topCategory.amount)} · ${summary.topCategory.sharePct}%` : undefined}
        iconBg="rgba(180,83,9,0.1)"
        iconColor="var(--color-warning)"
        isLoading={isLoading}
      />
      <KPICard
        icon="trending_up"
        label={t("expenses.headers.estimated_net_profit")}
        value={summary ? formatCurrency(netProfit) : "—"}
        sub={summary ? `${t("expenses.kpis.sales_label")}${formatCurrency(summary.totalSalesMonth)}` : undefined}
        trend={summary?.netProfitChangePct}
        trendLabel={t("expenses.kpis.vs_last_month")}
        iconBg={isPositive ? "rgba(39,104,104,0.12)" : "rgba(186,26,26,0.1)"}
        iconColor={isPositive ? "var(--color-tertiary)" : "var(--color-error)"}
        isLoading={isLoading}
        accent
      />
    </div>
  );
}
