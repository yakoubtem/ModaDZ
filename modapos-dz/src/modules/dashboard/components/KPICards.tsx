import { DollarSign, ShoppingBag, Box, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface KPICardsProps {
  kpis?: DashboardStats;
  isLoading: boolean;
}

export function KPICards({ kpis, isLoading }: KPICardsProps) {
  if (isLoading || !kpis) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] space-y-3"
          >
            <div className="flex justify-between items-start">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-9 rounded-[var(--radius-lg)]" />
            </div>
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-3.5 w-20" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Revenus aujourd'hui",
      value: formatCurrency(kpis.todayRevenue),
      subtext: `${kpis.todaySalesCount} vente${kpis.todaySalesCount !== 1 ? "s" : ""}`,
      icon: DollarSign,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      accent: "border-l-emerald-500",
      trend: null,
    },
    {
      title: "Revenus ce mois",
      value: formatCurrency(kpis.monthRevenue),
      subtext: `${kpis.monthSalesCount} vente${kpis.monthSalesCount !== 1 ? "s" : ""}`,
      icon: ShoppingBag,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      accent: "border-l-blue-500",
      trend: null,
    },
    {
      title: "Catalogue",
      value: kpis.totalProducts.toString(),
      subtext: "Produits actifs",
      icon: Box,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
      accent: "border-l-amber-500",
      trend: null,
    },
    {
      title: "Clients",
      value: kpis.totalCustomers.toString(),
      subtext: "Total enregistrés",
      icon: Users,
      iconColor: "text-violet-600",
      iconBg: "bg-violet-50",
      accent: "border-l-violet-500",
      trend: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={cn(
            "bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-xl)]",
            "border border-[var(--color-border)] border-l-4 shadow-[var(--shadow-sm)]",
            "hover:shadow-[var(--shadow-md)] transition-shadow duration-200",
            "flex flex-col gap-3 relative overflow-hidden",
            card.accent
          )}
        >
          {/* Subtle decorative circle */}
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-[var(--color-bg-subtle)] opacity-60" />

          <div className="flex justify-between items-start relative">
            <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
              {card.title}
            </p>
            <div className={cn("p-2 rounded-[var(--radius-lg)] shrink-0", card.iconBg)}>
              <card.icon className={cn("w-4 h-4", card.iconColor)} />
            </div>
          </div>

          <div className="relative">
            <p className="text-2xl font-extrabold text-[var(--color-text-primary)] tabular-nums leading-none tracking-tight">
              {card.value}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1.5 font-medium">
              {card.subtext}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}