import { Package, AlertTriangle, Plus } from "lucide-react";
import type { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  onVariantNeeded: (product: Product) => void;
}

export function ProductCard({ product, onVariantNeeded }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
  const isOutOfStock = totalStock === 0;
  const isLowStock = !isOutOfStock && totalStock <= 10;

  const handleClick = () => {
    if (isOutOfStock) return;

    const activeVariants = product.variants.filter((v) => v.stock > 0);

    // Single in-stock variant → add directly without picker
    if (activeVariants.length === 1) {
      const v = activeVariants[0];
      addItem({
        variantId: v.id,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        size: v.size,
        color: v.color,
        imagePath: product.imagePath,
        unitPrice: product.price,
        maxStock: v.stock,
      });
      toast.success(`${product.name} ajouté`, { duration: 1200 });
      return;
    }

    // Multiple variants → open picker
    onVariantNeeded(product);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isOutOfStock}
      className={cn(
        "group relative flex flex-col text-left",
        "rounded-[var(--radius-xl)] border bg-[var(--color-bg-surface)]",
        "transition-all duration-300 overflow-hidden shadow-[var(--shadow-xs)]",
        isOutOfStock
          ? "border-[var(--color-border)] opacity-50 cursor-not-allowed grayscale-[0.5]"
          : "border-[var(--color-border)] hover:border-[var(--color-accent)]/50 hover:shadow-[var(--shadow-md)] hover:-translate-y-1 active:scale-[0.97] active:translate-y-0 cursor-pointer"
      )}
    >
      {/* Product Image */}
      <div className="aspect-square w-full bg-[var(--color-bg-subtle)] relative overflow-hidden">
        {product.imagePath ? (
          <img
            src={`media://${product.imagePath}`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10 text-[var(--color-text-muted)]" />
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">
              Épuisé
            </span>
          </div>
        )}

        {/* Low stock badge */}
        {isLowStock && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-[var(--color-warning)] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            <AlertTriangle className="w-2.5 h-2.5" />
            {totalStock}
          </div>
        )}

        {/* Add overlay on hover */}
        {!isOutOfStock && (
          <div className="absolute inset-0 bg-[var(--color-accent)]/0 group-hover:bg-[var(--color-accent)]/8 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--color-accent)] rounded-full p-2 shadow-lg">
              <Plus className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3.5 flex flex-col gap-1">
        <p className="text-[13px] font-bold text-[var(--color-text-primary)] leading-tight line-clamp-2">
          {product.name}
        </p>
        {product.category && (
          <p className="text-[10px] text-[var(--color-text-muted)]">
            {product.category.name}
          </p>
        )}
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm font-bold text-[var(--color-accent)] tabular-nums">
            {formatCurrency(product.price)}
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)]">
            {product.variants.length} var.
          </span>
        </div>
      </div>
    </button>
  );
}
