import { useState } from "react";
import { TopBar } from "@/components/layout/AppLayout";
import { useDashboard } from "@/modules/dashboard/hooks/useDashboard";
import { RevenueChart } from "@/modules/dashboard/components/RevenueChart";
import { PaymentDistributionChart } from "@/modules/dashboard/components/PaymentDistributionChart";
import { TopProductsList } from "@/modules/dashboard/components/TopProductsList";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

type Period = 7 | 30 | 90;

export function StatsPage() {
  const { t, isRtl } = useTranslation();
  const [period, setPeriod] = useState<Period>(30);
  const { data, isLoading } = useDashboard(period);

  const PERIOD_OPTIONS: { value: Period; label: string }[] = [
    { value: 7, label: t("dashboard.stats.periods.7") },
    { value: 30, label: t("dashboard.stats.periods.30") },
    { value: 90, label: t("dashboard.stats.periods.90") },
  ];

  // Derived KPIs from real dashboard data
  const kpis = data?.kpis;
  const avgTicket =
    kpis && kpis.monthSalesCount > 0
      ? kpis.monthRevenue / kpis.monthSalesCount
      : 0;

  const STAT_CARDS = [
    {
      label: t("dashboard.stats.kpis.month_revenue"),
      value: kpis ? formatCurrency(kpis.monthRevenue) : "—",
      icon: "trending_up",
      sub: t("dashboard.stats.kpis.transactions_count", { count: kpis?.monthSalesCount ?? 0 }),
    },
    {
      label: t("dashboard.stats.kpis.avg_ticket"),
      value: kpis ? formatCurrency(avgTicket) : "—",
      icon: "receipt_long",
      sub: t("dashboard.stats.kpis.this_month"),
    },
    {
      label: t("dashboard.stats.kpis.total_transactions"),
      value: kpis?.monthSalesCount?.toLocaleString(isRtl ? "ar-DZ" : "fr-DZ") ?? "—",
      icon: "point_of_sale",
      sub: t("dashboard.stats.kpis.this_month"),
    },
    {
      label: t("dashboard.stats.kpis.revenue_today"),
      value: kpis ? formatCurrency(kpis.todayRevenue) : "—",
      icon: "today",
      sub: t("dashboard.stats.kpis.sales_count", { count: kpis?.todaySalesCount ?? 0 }),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopBar
        title={t("dashboard.stats.title")}
        description={t("dashboard.stats.description")}
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexDirection: isRtl ? "row-reverse" : "row" }}>
            <span style={{ fontSize: "var(--text-label-sm)", color: "var(--color-secondary)", letterSpacing: "var(--ls-label-sm)", textTransform: "uppercase" }}>
              {t("dashboard.stats.period")}
            </span>
            <div style={{ display: "flex", gap: "4px", background: "var(--color-surface-container-high)", borderRadius: "var(--radius-lg)", padding: "4px", flexDirection: isRtl ? "row-reverse" : "row" }}>
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
              <div key={card.label} className="kpi-card animate-fade-in" style={{ textAlign: isRtl ? "right" : "left" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexDirection: isRtl ? "row-reverse" : "row" }}>
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
            style={{ borderRadius: "var(--radius-xl)", padding: "24px", height: 320, display: "flex", flexDirection: "column", textAlign: isRtl ? "right" : "left" }}
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
                flexDirection: isRtl ? "row-reverse" : "row",
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
              {t("dashboard.stats.summary.title")}
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
                  { label: t("dashboard.stats.summary.revenue"), value: formatCurrency(kpis?.monthRevenue ?? 0), icon: "payments" },
                  { label: t("dashboard.stats.summary.sales"), value: (kpis?.monthSalesCount ?? 0).toLocaleString(isRtl ? "ar-DZ" : "fr-DZ"), icon: "shopping_cart" },
                  { label: t("dashboard.stats.summary.avg_ticket"), value: formatCurrency(avgTicket), icon: "receipt_long" },
                  { label: t("dashboard.stats.summary.catalog_products"), value: (kpis?.totalProducts ?? 0).toLocaleString(isRtl ? "ar-DZ" : "fr-DZ"), icon: "inventory_2" },
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
                      flexDirection: isRtl ? "row-reverse" : "row",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
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
