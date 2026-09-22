import { Loader2, SearchX } from "lucide-react";
import type { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { useTranslation } from "@/hooks/useTranslation";

interface ProductGridProps {
  products: Product[];
  isSearching: boolean;
  query: string;
  onVariantNeeded: (product: Product) => void;
}

export function ProductGrid({
  products,
  isSearching,
  query,
  onVariantNeeded,
}: ProductGridProps) {
  const { t } = useTranslation();

  if (isSearching) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="flex flex-col items-center gap-2 text-[var(--color-text-muted)]">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="text-sm">{t("pos.searching")}</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-[var(--color-text-muted)]">
        <SearchX className="w-10 h-10 mb-2" />
        <p className="text-sm font-medium">{t("pos.no_products_found")}</p>
        {query && (
          <p className="text-xs mt-1">
            {t("pos.no_results_for", { query })}
          </p>
        )}
      </div>
    );
  }

  return (
    <div 
      className="grid gap-3 pb-4"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onVariantNeeded={onVariantNeeded}
        />
      ))}
    </div>
  );
}
