import { Loader2, SearchX } from "lucide-react";
import type { Product } from "@/types";
import { ProductCard } from "./ProductCard";

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
  if (isSearching) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="flex flex-col items-center gap-2 text-[var(--color-text-muted)]">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="text-sm">Recherche en cours…</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-[var(--color-text-muted)]">
        <SearchX className="w-10 h-10 mb-2" />
        <p className="text-sm font-medium">Aucun produit trouvé</p>
        {query && (
          <p className="text-xs mt-1">
            Aucun résultat pour «{" "}
            <span className="text-[var(--color-text-secondary)]">{query}</span> »
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-4">
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
