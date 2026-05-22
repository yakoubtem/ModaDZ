import { formatCurrency } from "@/lib/utils";
import type { TopProduct } from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";
import { PackageOpen } from "lucide-react";

interface TopProductsListProps {
  products?: TopProduct[];
  isLoading: boolean;
}

export function TopProductsList({ products, isLoading }: TopProductsListProps) {
  if (isLoading || !products) {
    return (
      <div className="bg-[var(--color-bg-elevated)] p-5 rounded-lg border border-[var(--color-border)] flex flex-col gap-4">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-3 mt-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-elevated)] p-5 rounded-lg border border-[var(--color-border)]">
      <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
        <PackageOpen className="w-5 h-5 text-[var(--color-text-muted)]" />
        Meilleures ventes (30j)
      </h3>
      <div className="space-y-4">
        {products.length === 0 ? (
          <p className="text-[var(--color-text-muted)] text-sm italic py-4 text-center">
            Aucune vente enregistrée
          </p>
        ) : (
          products.map((product, idx) => (
            <div key={product.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[var(--color-bg-overlay)] flex items-center justify-center font-bold text-sm text-[var(--color-text-muted)] shrink-0">
                #{idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                  {product.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {product.size && product.color
                    ? `${product.size} / ${product.color}`
                    : `Var. #${product.id}`}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-[var(--color-text-primary)] tabular-nums">
                  {formatCurrency(product.revenueGenerated)}
                </p>
                <p className="text-xs text-[var(--color-accent)] font-medium">
                  {product.quantitySold} unités
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}