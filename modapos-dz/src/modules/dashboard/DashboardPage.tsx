import { PageHeader, PageContent } from "@/components/layout/AppLayout";
import { useDashboard } from "./hooks/useDashboard";
import { KPICards } from "./components/KPICards";
import { RevenueChart } from "./components/RevenueChart";
import { PaymentDistributionChart } from "./components/PaymentDistributionChart";
import { TopProductsList } from "./components/TopProductsList";
import { AlertsPanel } from "./components/AlertsPanel";

export function DashboardPage() {
  const { data, isLoading } = useDashboard(30); // 30 days default

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble en temps réel de l'activité du magasin"
      />
      <PageContent className="space-y-6">
        <div className="animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          <KPICards kpis={data?.kpis} isLoading={isLoading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slide-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          <div className="lg:col-span-8 flex flex-col gap-6">
            <RevenueChart data={data?.revenueChart} isLoading={isLoading} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PaymentDistributionChart data={data?.paymentMethods} isLoading={isLoading} />
              <TopProductsList products={data?.topProducts} isLoading={isLoading} />
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col">
            <AlertsPanel
              recentSales={data?.recentSales}
              lowStock={data?.lowStockVariants}
              isLoading={isLoading}
            />
          </div>
        </div>
      </PageContent>
    </>
  );
}