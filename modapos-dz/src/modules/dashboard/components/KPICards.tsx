import { formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/types";

interface KPICardsProps {
  kpis?: DashboardStats;
  isLoading: boolean;
}

const CARDS = [
  {
    label: "Revenu du jour",
    icon: "payments",
    trend: null,
    trendDir: null,
    trendVs: "Ventes du jour",
    valueKey: "todayRevenue" as const,
    format: "currency",
  },
  {
    label: "Revenu du mois",
    icon: "account_balance_wallet",
    trend: null,
    trendDir: null,
    trendVs: "Mois en cours",
    valueKey: "monthRevenue" as const,
    format: "currency",
  },
  {
    label: "Dépenses du mois",
    icon: "receipt_long",
    trend: null,
    trendDir: null,
    trendVs: "Mois en cours",
    valueKey: "monthExpenses" as const,
    format: "currency",
  },
  {
    label: "Bénéfice net",
    icon: "trending_up",
    trend: null,
    trendDir: null,
    trendVs: "Mois en cours",
    valueKey: "netProfitMonth" as const,
    format: "currency",
  },
  {
    label: "Catalogue",
    icon: "inventory_2",
    trend: null,
    trendDir: null,
    trendVs: "Produits actifs",
    valueKey: "totalProducts" as const,
    format: "number",
  },
  {
    label: "Clients",
    icon: "group",
    trend: null,
    trendDir: null,
    trendVs: "Total enregistrés",
    valueKey: "totalCustomers" as const,
    format: "number",
  },
];


export function KPICards({ kpis, isLoading }: KPICardsProps) {
  if (isLoading || !kpis) {
    return (
      <>
        {[...Array(4)].map((_, i) => (
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
            : (raw?.toLocaleString("fr-DZ") ?? "—");

        return (
          <div key={card.label} className="kpi-card animate-fade-in">
            {/* Top row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <span
                style={{
                  fontSize: "var(--text-label-md)",
                  letterSpacing: "var(--ls-label-md)",
                  fontWeight: "var(--fw-label-md)",
                  color: "var(--color-secondary)",
                }}
              >
                {card.label}
              </span>
              <div className="kpi-icon">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
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
              }}
            >
              {value}
            </div>

            {/* Trend */}
            <div style={{ display: "flex", alignItems: "center", fontSize: "14px" }}>
              {card.trend && (
                <span
                  style={{
                    color: "var(--color-tertiary)",
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
              <span style={{ color: "var(--color-secondary)", marginLeft: card.trend ? "8px" : 0 }}>
                {card.trendVs}
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
}