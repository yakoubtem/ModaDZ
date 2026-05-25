import { formatCurrency, formatDate } from "@/lib/utils";
import type { RecentSale, LowStockVariant } from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";
import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface AlertsPanelProps {
  recentSales?: RecentSale[];
  lowStock?: LowStockVariant[];
  isLoading: boolean;
}

export function AlertsPanel({ recentSales, lowStock, isLoading }: AlertsPanelProps) {
  if (isLoading || !recentSales || !lowStock) {
    return (
      <div className="flex flex-col gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] flex flex-col gap-6">
            <Skeleton className="h-5 w-40" />
            <div className="space-y-4">
              {[...Array(4)].map((_, j) => (
                <Skeleton key={j} className="h-10 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* ── Low Stock Alerts ── */}
      <div className="bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] transition-shadow duration-200 hover:shadow-[var(--shadow-md)] flex flex-col h-[340px]">
        <h3 className="text-[14px] font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Alertes de stock
          {lowStock.length > 0 && (
            <span className="ml-auto inline-flex items-center justify-center w-5 h-5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-100">
              {lowStock.length}
            </span>
          )}
        </h3>

        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {lowStock.length === 0 ? (
            <div className="flex items-center gap-2.5 py-4 px-3 rounded-xl bg-emerald-50/50 border border-emerald-100/50 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <p className="text-[13px] font-medium">Tous les stocks sont parfaits.</p>
            </div>
          ) : (
            lowStock.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center bg-amber-50/40 border border-amber-100/60 px-3.5 py-2.5 rounded-xl hover:bg-amber-50/60 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    {item.size} · {item.color}
                  </p>
                </div>
                <Badge
                  variant={item.stock === 0 ? "danger" : "warning"}
                  className="ml-3 shrink-0 rounded-lg"
                >
                  {item.stock === 0 ? "Rupture" : `${item.stock} dispo`}
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Recent Sales Feed ── */}
      <div className="bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] transition-shadow duration-200 hover:shadow-[var(--shadow-md)] flex flex-col flex-1 min-h-0">
        <h3 className="text-[14px] font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[var(--color-text-muted)]" />
          Ventes récentes
        </h3>

        <div className="space-y-1.5 flex-1 overflow-y-auto pr-1 divide-y-0 h-full">
          {recentSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-muted)] opacity-80">
              <CheckCircle2 className="w-8 h-8 mb-2" />
              <p className="text-[14px] italic">Aucune vente récente.</p>
            </div>
          ) : (
            recentSales.map((sale) => {
              const totalItems = sale.items.reduce((s, i) => s + i.quantity, 0);
              return (
                <div
                  key={sale.id}
                  className="flex justify-between items-center py-2.5 px-3 rounded-xl hover:bg-[var(--color-bg-subtle)] transition-colors border border-transparent hover:border-neutral-100"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                      {sale.customer ? sale.customer.name : "Client passager"}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      {formatDate(sale.createdAt)} · {totalItems} art.
                    </p>
                  </div>
                  <span className="text-sm font-bold text-[var(--color-text-primary)] tabular-nums shrink-0 ml-2">
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