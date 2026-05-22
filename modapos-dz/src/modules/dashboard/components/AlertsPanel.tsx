import { formatCurrency, formatDate } from "@/lib/utils";
import type { RecentSale, LowStockVariant } from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";
import { AlertCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface AlertsPanelProps {
  recentSales?: RecentSale[];
  lowStock?: LowStockVariant[];
  isLoading: boolean;
}

export function AlertsPanel({ recentSales, lowStock, isLoading }: AlertsPanelProps) {
  if (isLoading || !recentSales || !lowStock) {
    return (
      <div className="bg-[var(--color-bg-elevated)] p-5 rounded-lg border border-[var(--color-border)] flex flex-col gap-4">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-3 mt-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Low Stock Alerts */}
      <div className="bg-[var(--color-bg-elevated)] p-5 rounded-lg border border-[var(--color-border)]">
        <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-[var(--color-warning)]" />
          Alertes de stock
        </h3>
        <div className="space-y-3">
          {lowStock.length === 0 ? (
            <p className="text-[var(--color-text-muted)] text-sm italic py-2">
              Tous les niveaux de stock sont optimaux.
            </p>
          ) : (
            lowStock.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-[var(--color-bg-overlay)] p-2.5 rounded-md border border-[var(--color-border)]">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {item.size} / {item.color}
                  </p>
                </div>
                <Badge variant={item.stock === 0 ? "destructive" : "warning"} className="ml-2 shrink-0">
                  {item.stock} en stock
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Sales Feed */}
      <div className="bg-[var(--color-bg-elevated)] p-5 rounded-lg border border-[var(--color-border)] flex-1 min-h-0">
        <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[var(--color-text-muted)]" />
          Ventes récentes
        </h3>
        <div className="space-y-4">
          {recentSales.length === 0 ? (
            <p className="text-[var(--color-text-muted)] text-sm italic py-2">
              Aucune vente récente.
            </p>
          ) : (
            recentSales.map((sale) => {
              const totalItems = sale.items.reduce((s, i) => s + i.quantity, 0);
              return (
                <div key={sale.id} className="flex justify-between items-start border-b border-[var(--color-border)] pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {sale.customer ? sale.customer.name : "Client passager"}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {formatDate(sale.createdAt)} · {totalItems} art.
                    </p>
                  </div>
                  <span className="text-sm font-bold text-[var(--color-text-primary)] tabular-nums">
                    {formatCurrency(sale.total)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}