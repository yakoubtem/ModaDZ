import { formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

interface KPICardsProps {
  kpis?: DashboardStats;
  isLoading: boolean;
}

const CARDS = [
  {
    labelKey: "dashboard.kpis.revenue_month",
    icon: "account_balance_wallet",
    trend: null,
    trendDir: null,
    trendVsKey: "dashboard.month_in_progress",
    valueKey: "monthRevenue" as const,
    format: "currency",
    iconBg: "rgba(212, 175, 55, 0.15)",
    iconColor: "var(--color-primary)",
  },
  {
    labelKey: "dashboard.kpis.cogs",
    icon: "inventory",
    trend: null,
    trendDir: null,
    trendVsKey: "dashboard.month_in_progress",
    valueKey: "monthCOGS" as const,
    format: "currency",
    iconBg: "rgba(2, 132, 199, 0.12)",
    iconColor: "var(--color-info)",
  },
  {
    labelKey: "dashboard.kpis.gross_profit",
    icon: "trending_up",
    trend: null,
    trendDir: null,
    trendVsKey: "dashboard.month_in_progress",
    valueKey: "monthGrossProfit" as const,
    format: "currency",
    iconBg: "rgba(39, 104, 104, 0.12)",
    iconColor: "var(--color-tertiary)",
  },
  {
    labelKey: "dashboard.kpis.expenses",
    icon: "receipt_long",
    trend: null,
    trendDir: null,
    trendVsKey: "dashboard.month_in_progress",
    valueKey: "monthExpenses" as const,
    format: "currency",
    iconBg: "rgba(186, 26, 26, 0.1)",
    iconColor: "var(--color-error)",
  },
  {
    labelKey: "dashboard.kpis.net_profit",
    icon: "payments",
    trend: null,
    trendDir: null,
    trendVsKey: "dashboard.month_in_progress",
    valueKey: "netProfitMonth" as const,
    format: "currency",
    iconBg: "rgba(39, 104, 104, 0.15)",
    iconColor: "var(--color-tertiary)",
  },
];

export function KPICards({ kpis, isLoading }: KPICardsProps) {
  const { t, isRtl } = useTranslation();

  if (isLoading || !kpis) {
    return (
      <>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="kpi-card skeleton" style={{ height: 140 }} />
        ))}
      </>
    );
  }

  return (
    <>
      {CARDS.map((card) => {
        const raw = kpis[card.valueKey] as number;
        const value =
          card.format === "currency"
            ? formatCurrency(raw)
            : (raw?.toLocaleString(isRtl ? "ar-DZ" : "fr-DZ") ?? "—");

        return (
          <div key={card.labelKey} className="kpi-card animate-fade-in" style={{ textAlign: isRtl ? "right" : "left" }}>
            {/* Top row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexDirection: isRtl ? "row-reverse" : "row" }}>
              <span
                style={{
                  fontSize: "var(--text-label-md)",
                  letterSpacing: "var(--ls-label-md)",
                  fontWeight: "var(--fw-label-md)",
                  color: "var(--color-secondary)",
                }}
              >
                {t(card.labelKey)}
              </span>
              <div
                className="kpi-icon"
                style={{
                  background: card.iconBg,
                  color: card.iconColor,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: card.iconColor }}>
                  {card.icon}
                </span>
              </div>
            </div>

            {/* Value */}
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-headline-lg)",
                fontWeight: "var(--fw-headline-lg)",
                color: "var(--color-on-surface)",
                marginBottom: "8px",
                letterSpacing: "-0.01em",
                direction: "ltr",
                textAlign: isRtl ? "right" : "left",
              }}
            >
              {value}
            </div>

            {/* Trend */}
            <div style={{ display: "flex", alignItems: "center", fontSize: "14px", flexDirection: isRtl ? "row-reverse" : "row" }}>
              {card.trend && (
                <span
                  style={{
                    color: "var(--color-teal)",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                    {card.trendDir === "up" ? "trending_up" : "trending_down"}
                  </span>
                  {card.trend}
                </span>
              )}
              <span style={{ color: "var(--color-secondary)", marginLeft: isRtl ? 0 : (card.trend ? "8px" : 0), marginRight: isRtl ? (card.trend ? "8px" : 0) : 0 }}>
                {t(card.trendVsKey)}
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
}