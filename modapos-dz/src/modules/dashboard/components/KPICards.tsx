import { DollarSign, ShoppingBag, Box, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";

interface KPICardsProps {
  kpis?: DashboardStats;
  isLoading: boolean;
}

export function KPICards({ kpis, isLoading }: KPICardsProps) {
  if (isLoading || !kpis) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[var(--color-bg-elevated)] p-5 rounded-lg border border-[var(--color-border)] space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Revenus (Aujourd'hui)",
      value: formatCurrency(kpis.todayRevenue),
      subtext: `${kpis.todaySalesCount} ventes`,
      icon: DollarSign,
      color: "text-[var(--color-success)]",
      bg: "bg-[var(--color-success-subtle)]",
    },
    {
      title: "Revenus (Ce mois)",
      value: formatCurrency(kpis.monthRevenue),
      subtext: `${kpis.monthSalesCount} ventes`,
      icon: ShoppingBag,
      color: "text-[var(--color-accent)]",
      bg: "bg-[var(--color-accent)]/10",
    },
    {
      title: "Catalogue",
      value: kpis.totalProducts.toString(),
      subtext: "Produits actifs",
      icon: Box,
      color: "text-[var(--color-warning)]",
      bg: "bg-[var(--color-warning)]/10",
    },
    {
      title: "Clients",
      value: kpis.totalCustomers.toString(),
      subtext: "Total enregistrés",
      icon: Users,
      color: "text-indigo-400",
      bg: "bg-indigo-400/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-[var(--color-bg-elevated)] p-5 rounded-lg border border-[var(--color-border)] flex flex-col gap-2 relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <p className="text-[var(--color-text-muted)] text-sm font-medium">{card.title}</p>
            <div className={`p-2 rounded-md ${card.bg}`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{card.value}</p>
            <p className="text-[var(--color-text-muted)] text-xs mt-1">{card.subtext}</p>
          </div>
        </div>
      ))}
    </div>
  );
}