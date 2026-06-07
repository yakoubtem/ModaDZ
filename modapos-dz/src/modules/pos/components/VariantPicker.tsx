import { Package, AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useCartStore } from "@/store/cartStore";
import type { Product, ProductVariant } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

interface VariantPickerProps {
  product: Product | null;
  onClose: () => void;
}

function VariantButton({
  variant,
  onSelect,
}: {
  variant: ProductVariant;
  onSelect: (v: ProductVariant) => void;
}) {
  const { t } = useTranslation();
  const outOfStock = variant.stock === 0;

  return (
    <button
      onClick={() => !outOfStock && onSelect(variant)}
      disabled={outOfStock}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 p-3 rounded-[var(--radius-md)]",
        "border-2 text-center transition-all duration-150",
        outOfStock
          ? "border-[var(--color-border)] opacity-40 cursor-not-allowed"
          : "border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)] cursor-pointer",
        !outOfStock && "active:scale-95"
      )}
    >
      <span className="text-sm font-semibold text-[var(--color-text-primary)]">
        {variant.size}
      </span>
      <span className="text-xs text-[var(--color-text-secondary)]">
        {variant.color}
      </span>
      <span
        className={cn(
          "text-xs font-medium",
          variant.stock <= 5
            ? "text-[var(--color-warning)]"
            : "text-[var(--color-text-muted)]"
        )}
      >
        {outOfStock ? t("pos.variant_picker.out_of_stock") : t("pos.variant_picker.items_remaining", { count: variant.stock })}
      </span>
    </button>
  );
}

export function VariantPicker({ product, onClose }: VariantPickerProps) {
  const { t } = useTranslation();
  const addItem = useCartStore((s) => s.addItem);

  if (!product) return null;

  const handleSelect = (variant: ProductVariant) => {
    addItem({
      variantId: variant.id,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      size: variant.size,
      color: variant.color,
      imagePath: product.imagePath,
      unitPrice: product.price,
      maxStock: variant.stock,
    });
    toast.success(t("pos.variant_picker.variant_added_toast", {
      name: product.name,
      size: variant.size,
      color: variant.color,
    }), {
      duration: 1500,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={!!product}
      onClose={onClose}
      title={product.name}
      description={`${formatCurrency(product.price)} · ${t("pos.variant_picker.select_variant")}`}
      size="sm"
    >
      {/* Product image */}
      <div className="mb-4 flex justify-center">
        <img
          src={product.imagePath ? `media://${product.imagePath}` : "/default-product.png"}
          alt={product.name}
          className="w-24 h-24 object-cover rounded-[var(--radius-lg)] border border-[var(--color-border)]"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/default-product.png";
          }}
        />
      </div>

      {/* Variants grid */}
      {product.variants.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-[var(--color-text-muted)]">
          <Package className="w-8 h-8" />
          <p className="text-sm">{t("pos.variant_picker.no_variant")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {product.variants.map((v) => (
            <VariantButton
              key={v.id}
              variant={v}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      {/* Low stock warning */}
      {product.variants.some((v) => v.stock > 0 && v.stock <= 5) && (
        <div className="mt-3 flex items-center gap-2 text-xs text-[var(--color-warning)] bg-[var(--color-warning-subtle)] px-3 py-2 rounded-[var(--radius-md)]">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          {t("pos.variant_picker.low_stock_warning_some")}
        </div>
      )}
    </Modal>
  );
}
