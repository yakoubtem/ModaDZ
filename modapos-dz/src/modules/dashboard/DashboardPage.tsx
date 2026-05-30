import { TopBar } from "@/components/layout/AppLayout";
import { useDashboard } from "./hooks/useDashboard";
import { KPICards } from "./components/KPICards";
import { RevenueChart } from "./components/RevenueChart";
import { PaymentDistributionChart } from "./components/PaymentDistributionChart";
import { TopProductsList } from "./components/TopProductsList";
import { AlertsPanel } from "./components/AlertsPanel";
import { DebtWidget } from "./components/DebtWidget";

export function DashboardPage() {
  const { data, isLoading } = useDashboard(30);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopBar
        title="Tableau de bord"
        description="Aperçu en temps réel de votre activité de luxe."
      />

      <main
        style={{
          padding: "var(--space-container)",
          maxWidth: 1680,
          width: "100%",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-section)",
        }}
        className="animate-fade-in"
      >
        {/* ── KPI Grid ── */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "var(--space-card-gap)",
          }}
        >
          <KPICards kpis={data?.kpis} isLoading={isLoading} />
        </section>

        {/* ── Bento Grid ── */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "var(--space-card-gap)",
          }}
          className="dashboard-bento"
        >
          {/* Left column */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-card-gap)",
            }}
            className="dashboard-left"
          >
            {/* Revenue chart */}
            <div
              className="glass-card"
              style={{ borderRadius: "var(--radius-xl)", padding: "24px", height: 400, display: "flex", flexDirection: "column" }}
            >
              <RevenueChart data={data?.revenueChart} isLoading={isLoading} />
            </div>

            {/* Bottom row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "var(--space-card-gap)",
              }}
              className="dashboard-bottom"
            >
              <div
                className="glass-card"
                style={{ borderRadius: "var(--radius-xl)", padding: "24px", height: 300, display: "flex", flexDirection: "column" }}
              >
                <PaymentDistributionChart data={data?.paymentMethods} isLoading={isLoading} />
              </div>

              <div
                className="glass-card"
                style={{ borderRadius: "var(--radius-xl)", padding: "24px", height: 300, display: "flex", flexDirection: "column", overflow: "hidden" }}
              >
                <TopProductsList products={data?.topProducts} isLoading={isLoading} />
              </div>
            </div>
          </div>

          {/* Right column — Alerts + Debt Widget */}
          <div className="dashboard-right">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-card-gap)",
                position: "sticky",
                top: 100,
              }}
            >
              <div
                className="glass-card"
                style={{ borderRadius: "var(--radius-xl)", padding: "24px", display: "flex", flexDirection: "column" }}
              >
                <AlertsPanel recentSales={data?.recentSales} lowStock={data?.lowStockVariants} isLoading={isLoading} />
              </div>

              {/* ── Créances clients widget ── */}
              <DebtWidget
                totalDebt={data?.debtWidget?.totalDebt ?? 0}
                debtorCount={data?.debtWidget?.debtorCount ?? 0}
                recoveryRate={data?.debtWidget?.recoveryRate ?? 0}
                isLoading={isLoading}
              />
            </div>
          </div>
        </section>
      </main>

      <style>{`
        @media (min-width: 1024px) {
          .dashboard-bento {
            grid-template-columns: 1fr;
          }
        }
        @media (min-width: 1280px) {
          .dashboard-bento {
            grid-template-columns: 8fr 4fr;
          }
          .dashboard-left {
            grid-column: 1;
          }
          .dashboard-right {
            grid-column: 2;
          }
        }
        @media (max-width: 768px) {
          .dashboard-bottom {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
