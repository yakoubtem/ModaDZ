import { formatCurrency } from "@/lib/utils";
import type { TopProduct } from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopProductsListProps {
  products?: TopProduct[];
  isLoading: boolean;
}

const rankColors = [
  { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200/50" },
  { bg: "bg-slate-50",  text: "text-slate-500",  border: "border-slate-200/50" },
  { bg: "bg-orange-50", text: "text-orange-500", border: "border-orange-200/50" },
];

export function TopProductsList({ products, isLoading }: TopProductsListProps) {
  if (isLoading || !products) {
    return (
      <div className="bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] h-[400px] flex flex-col gap-6 shadow-[var(--shadow-sm)]">
        <Skeleton className="h-5 w-48" />
        <div className="space-y-4 flex-1">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] h-[400px] flex flex-col shadow-[var(--shadow-sm)] transition-shadow duration-200 hover:shadow-[var(--shadow-md)] overflow-hidden">
      <div className="mb-4">
        <h3 className="text-[14px] font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          Meilleures ventes (30j)
        </h3>
        <p className="text-[12px] text-[var(--color-text-muted)] mt-1 ml-6">
          Articles générant le plus de revenus
        </p>
      </div>

      <div className="space-y-1.5 mt-5 flex-1 overflow-y-auto pr-1">
        {products.length === 0 ? (
          <p className="text-[var(--color-text-muted)] text-sm py-8 text-center italic">
            Aucune vente enregistrée
          </p>
        ) : (
          products.map((product, idx) => {
            const rank = rankColors[idx] ?? { bg: "bg-[var(--color-bg-elevated)]", text: "text-[var(--color-text-muted)]", border: "border-[var(--color-border)]" };
            return (
              <div
                key={product.id}
                className="flex items-center gap-3.5 py-2 px-2.5 rounded-xl hover:bg-[var(--color-bg-subtle)] transition-colors border border-transparent hover:border-neutral-100"
              >
                {/* Rank badge */}
                <div
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border",
                    rank.bg, rank.text, rank.border
                  )}
                >
                  {idx + 1}
                </div>

                {/* Product info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    {product.size && product.color
                      ? `${product.size} / ${product.color}`
                      : `Variante #${product.id}`}
                  </p>
                </div>

                {/* Stats */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-[var(--color-text-primary)] tabular-nums">
                    {formatCurrency(product.revenueGenerated)}
                  </p>
                  <p className="text-[11px] text-[var(--color-accent)] font-semibold mt-0.5">
                    {product.quantitySold} vendus
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}