import { TopBar } from "@/components/layout/AppLayout";
import { useDashboard } from "./hooks/useDashboard";
import { KPICards } from "./components/KPICards";
import { RevenueChart } from "./components/RevenueChart";
import { PaymentDistributionChart } from "./components/PaymentDistributionChart";
import { TopProductsList } from "./components/TopProductsList";
import { AlertsPanel } from "./components/AlertsPanel";
import { DebtWidget } from "./components/DebtWidget";
import { RestockWidget } from "./components/RestockWidget";
import { SupplierDebtWidget } from "./components/SupplierDebtWidget";
import { OpenRegistersWidget } from "./components/OpenRegistersWidget";
import { MostPrintedProductsWidget } from "./components/MostPrintedProductsWidget";
import { LicenseWidget } from "./components/LicenseWidget";
import { useTranslation } from "@/hooks/useTranslation";

export function DashboardPage() {
  const { data, isLoading } = useDashboard(30);
  const { t } = useTranslation();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopBar
        title={t("dashboard.title")}
        description={t("dashboard.subtitle")}
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

            {/* Top Products */}
            <div
              className="glass-card"
              style={{ borderRadius: "var(--radius-xl)", padding: "24px", height: 300, display: "flex", flexDirection: "column", overflow: "hidden" }}
            >
              <TopProductsList products={data?.topProducts} isLoading={isLoading} />
            </div>

            {/* Modes de paiement */}
            <div
              className="glass-card"
              style={{ borderRadius: "var(--radius-xl)", padding: "24px", height: 300, display: "flex", flexDirection: "column" }}
            >
              <PaymentDistributionChart data={data?.paymentMethods} isLoading={isLoading} />
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
              {/* ── License Widget ── */}
              <LicenseWidget isLoading={isLoading} />

              <div
                className="glass-card"
                style={{ borderRadius: "var(--radius-xl)", padding: "24px", display: "flex", flexDirection: "column" }}
              >
                <AlertsPanel
                  recentSales={data?.recentSales}
                  lowStock={data?.lowStockVariants}
                  expenseAlerts={data?.expenseAlerts}
                  isLoading={isLoading}
                />
              </div>

              <div
                className="glass-card"
                style={{ borderRadius: "var(--radius-xl)", padding: "24px", display: "flex", flexDirection: "column" }}
              >
                <RestockWidget lowStock={data?.lowStockVariants} isLoading={isLoading} />
              </div>

              {/* ── Caisses ouvertes widget ── */}
              <OpenRegistersWidget
                openRegisters={data?.openRegisters ?? []}
                isLoading={isLoading}
              />

              {/* ── Créances clients widget ── */}
              <DebtWidget
                totalDebt={data?.debtWidget?.totalDebt ?? 0}
                debtorCount={data?.debtWidget?.debtorCount ?? 0}
                recoveryRate={data?.debtWidget?.recoveryRate ?? 0}
                isLoading={isLoading}
              />

              {/* ── Dettes fournisseurs widget ── */}
              <SupplierDebtWidget
                totalSupplierDebt={data?.supplierDebtWidget?.totalSupplierDebt ?? 0}
                debtorCount={data?.supplierDebtWidget?.debtorCount ?? 0}
                topSupplierDebts={data?.supplierDebtWidget?.topSupplierDebts ?? []}
                upcomingPayments={data?.supplierDebtWidget?.upcomingPayments ?? []}
                isLoading={isLoading}
              />

              {/* ── Étiquettes les plus imprimées ── */}
              <div
                className="glass-card"
                style={{ borderRadius: "var(--radius-xl)", padding: "24px", display: "flex", flexDirection: "column" }}
              >
                <MostPrintedProductsWidget isLoading={isLoading} />
              </div>
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

      `}</style>
    </div>
  );
}
