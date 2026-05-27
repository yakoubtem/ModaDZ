import { useState } from "react";
import { TopBar } from "@/components/layout/AppLayout";
import { useDashboard } from "@/modules/dashboard/hooks/useDashboard";
import { RevenueChart } from "@/modules/dashboard/components/RevenueChart";
import { PaymentDistributionChart } from "@/modules/dashboard/components/PaymentDistributionChart";
import { TopProductsList } from "@/modules/dashboard/components/TopProductsList";
import { formatCurrency } from "@/lib/utils";

type Period = 7 | 30 | 90;

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 7, label: "7 jours" },
  { value: 30, label: "30 jours" },
  { value: 90, label: "90 jours" },
];

export function StatsPage() {
  const [period, setPeriod] = useState<Period>(30);
  const { data, isLoading } = useDashboard(period);

  // Derived KPIs from real dashboard data
  const kpis = data?.kpis;
  const avgTicket =
    kpis && kpis.monthSalesCount > 0
      ? kpis.monthRevenue / kpis.monthSalesCount
      : 0;

  const STAT_CARDS = [
    {
      label: "CA du mois",
      value: kpis ? formatCurrency(kpis.monthRevenue) : "—",
      icon: "trending_up",
      sub: `${kpis?.monthSalesCount ?? 0} transactions`,
    },
    {
      label: "Ticket moyen",
      value: kpis ? formatCurrency(avgTicket) : "—",
      icon: "receipt_long",
      sub: "Ce mois-ci",
    },
    {
      label: "Transactions totales",
      value: kpis?.monthSalesCount?.toLocaleString("fr-DZ") ?? "—",
      icon: "point_of_sale",
      sub: "Ce mois-ci",
    },
    {
      label: "CA aujourd'hui",
      value: kpis ? formatCurrency(kpis.todayRevenue) : "—",
      icon: "today",
      sub: `${kpis?.todaySalesCount ?? 0} ventes`,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopBar
        title="Statistiques"
        description="Analyses et performances de votre boutique."
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "var(--text-label-sm)", color: "var(--color-secondary)", letterSpacing: "var(--ls-label-sm)", textTransform: "uppercase" }}>
              Période
            </span>
            <div style={{ display: "flex", gap: "4px", background: "var(--color-surface-container-high)", borderRadius: "var(--radius-lg)", padding: "4px" }}>
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPeriod(opt.value)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "none",
                    fontSize: "var(--text-label-sm)",
                    fontWeight: "var(--fw-label-sm)",
                    fontFamily: "var(--font-body)",
                    cursor: "pointer",
                    background: period === opt.value ? "var(--color-surface-container-lowest)" : "transparent",
                    color: period === opt.value ? "var(--color-on-surface)" : "var(--color-secondary)",
                    boxShadow: period === opt.value ? "var(--shadow-soft)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        }
      />

      <main
        style={{
          padding: "var(--space-container)",
          maxWidth: 1440,
          margin: "0 auto",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-section)",
        }}
        className="animate-fade-in"
      >
        {/* KPI row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "var(--space-card-gap)",
          }}
        >
          {isLoading
            ? [...Array(4)].map((_, i) => (
                <div key={i} className="kpi-card skeleton" style={{ height: 130 }} />
              ))
            : STAT_CARDS.map((card) => (
                <div key={card.label} className="kpi-card animate-fade-in">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <span style={{ fontSize: "var(--text-label-md)", fontWeight: "var(--fw-label-md)", letterSpacing: "var(--ls-label-md)", color: "var(--color-secondary)" }}>
                      {card.label}
                    </span>
                    <div className="kpi-icon">
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{card.icon}</span>
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--text-headline-lg)",
                      fontWeight: "var(--fw-headline-lg)",
                      color: "var(--color-on-surface)",
                      marginBottom: "8px",
                    }}
                  >
                    {card.value}
                  </div>
                  <div style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)" }}>
                    {card.sub}
                  </div>
                </div>
              ))}
        </div>

        {/* Charts grid */}
        <div style={{ display: "grid", gridTemplateColumns: "8fr 4fr", gap: "var(--space-card-gap)" }}>
          {/* Revenue chart */}
          <div
            className="glass-card"
            style={{ borderRadius: "var(--radius-xl)", padding: "24px", height: 400, display: "flex", flexDirection: "column" }}
          >
            <RevenueChart data={data?.revenueChart} isLoading={isLoading} />
          </div>

          {/* Payment distribution chart */}
          <div
            className="glass-card"
            style={{ borderRadius: "var(--radius-xl)", padding: "24px", height: 400, display: "flex", flexDirection: "column" }}
          >
            <PaymentDistributionChart data={data?.paymentMethods} isLoading={isLoading} />
          </div>
        </div>

        {/* Bottom grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-card-gap)" }}>
          {/* Top products */}
          <div
            className="glass-card"
            style={{ borderRadius: "var(--radius-xl)", padding: "24px", height: 320, display: "flex", flexDirection: "column" }}
          >
            <TopProductsList products={data?.topProducts} isLoading={isLoading} />
          </div>

          {/* Additional real stats: recent transactions summary */}
          <div
            className="glass-card"
            style={{ borderRadius: "var(--radius-xl)", padding: "24px", height: 320, display: "flex", flexDirection: "column" }}
          >
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
              Résumé de la période
            </h3>

            {isLoading ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 40, borderRadius: 8 }} />
                ))}
              </div>
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Chiffre d'affaires", value: formatCurrency(kpis?.monthRevenue ?? 0), icon: "payments" },
                  { label: "Nombre de ventes", value: (kpis?.monthSalesCount ?? 0).toLocaleString("fr-DZ"), icon: "shopping_cart" },
                  { label: "Ticket moyen", value: formatCurrency(avgTicket), icon: "receipt_long" },
                  { label: "Produits au catalogue", value: (kpis?.totalProducts ?? 0).toLocaleString("fr-DZ"), icon: "inventory_2" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "var(--radius-lg)",
                      background: "var(--color-surface-container-low)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-primary)" }}>
                        {stat.icon}
                      </span>
                      <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-on-surface-variant)" }}>
                        {stat.label}
                      </span>
                    </div>
                    <span style={{ fontSize: "var(--text-label-md)", fontWeight: "var(--fw-label-md)", color: "var(--color-on-surface)", fontVariantNumeric: "tabular-nums" }}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
