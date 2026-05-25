import type { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
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

  const handleClick = () => {
    if (isOutOfStock) return;
    const activeVariants = product.variants.filter((v) => v.stock > 0);
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
    onVariantNeeded(product);
  };

  return (
    <div
      className={`product-card${isOutOfStock ? " out-of-stock" : ""}`}
      onClick={handleClick}
      style={{ cursor: isOutOfStock ? "default" : "pointer" }}
    >
      {/* Image */}
      <div
        style={{
          aspectRatio: "1",
          background: "var(--color-surface-container-low)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {product.imagePath ? (
          <img
            src={`media://${product.imagePath}`}
            alt={product.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.5s ease",
            }}
            className="product-card-img"
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-outline)",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 48 }}>image</span>
          </div>
        )}

        {/* Stock badge */}
        {!isOutOfStock && (
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(4px)",
              padding: "2px 8px",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--text-label-sm)",
              fontWeight: "var(--fw-label-sm)",
              letterSpacing: "var(--ls-label-sm)",
              color: "var(--color-primary)",
            }}
          >
            En stock: {totalStock}
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(251,249,244,0.2)",
              backdropFilter: "blur(2px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                background: "rgba(228,226,221,0.9)",
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
                fontSize: "var(--text-label-md)",
                fontWeight: "var(--fw-label-md)",
                letterSpacing: "var(--ls-label-md)",
                color: "var(--color-on-surface-variant)",
              }}
            >
              Rupture
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div
        style={{
          padding: "16px",
          opacity: isOutOfStock ? 0.7 : 1,
        }}
      >
        <h3
          style={{
            fontSize: "var(--text-body-lg)",
            fontWeight: 600,
            color: "var(--color-on-surface)",
            marginBottom: "4px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {product.name}
        </h3>
        <p
          style={{
            fontSize: "var(--text-body-sm)",
            color: "var(--color-secondary)",
            marginBottom: "12px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {product.category?.name ?? ""}
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-headline-md)",
              fontWeight: 700,
              color: "var(--color-on-surface)",
            }}
          >
            {formatCurrency(product.price)}
          </span>
          {!isOutOfStock && (
            <button
              onClick={(e) => { e.stopPropagation(); handleClick(); }}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "var(--color-surface-container-high)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-on-surface)",
                cursor: "pointer",
                transition: "background 0.2s, color 0.2s",
              }}
              className="product-add-btn"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add_shopping_cart</span>
            </button>
          )}
        </div>
      </div>

      <style>{`
        .product-card:hover .product-card-img { transform: scale(1.05); }
        .product-card:hover .product-add-btn {
          background: var(--color-primary-container) !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
}
