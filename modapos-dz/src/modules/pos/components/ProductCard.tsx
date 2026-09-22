import type { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

interface ProductCardProps {
  product: Product;
  onVariantNeeded: (product: Product) => void;
}

export function ProductCard({ product, onVariantNeeded }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { t } = useTranslation();

  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
  const isOutOfStock = totalStock === 0;
  const isLowStock = totalStock > 0 && totalStock <= 5;

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
      toast.success(t("pos.product_added", { name: product.name }), { duration: 1200 });
      return;
    }
    onVariantNeeded(product);
  };

  let stockColor = "var(--color-tertiary)";
  if (isOutOfStock) {
    stockColor = "var(--color-error)";
  } else if (isLowStock) {
    stockColor = "var(--color-primary)";
  }

  // A subtle background for the badge to ensure readability over images
  const stockBg = isOutOfStock 
    ? "rgba(255, 255, 255, 0.9)" 
    : "rgba(255, 255, 255, 0.85)";

  return (
    <div
      onClick={handleClick}
      className="group relative flex flex-col h-full bg-[var(--color-surface-container-lowest)] rounded-[16px] overflow-hidden cursor-pointer"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid var(--color-outline-variant)",
        boxShadow: "0 2px 8px rgba(26, 26, 26, 0.04)",
        transition: "all 0.15s ease-out",
        transform: "translateY(0)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(26, 26, 26, 0.08)";
        e.currentTarget.style.borderColor = "var(--color-outline)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(26, 26, 26, 0.04)";
        e.currentTarget.style.borderColor = "var(--color-outline-variant)";
      }}
    >
      {/* Image Area */}
      <div
        style={{
          aspectRatio: "1/1",
          width: "100%",
          backgroundColor: "var(--color-background)",
          position: "relative",
          padding: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={product.imagePath ? `media://${product.imagePath}` : "/default-product.png"}
          alt={product.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            opacity: isOutOfStock ? 0.4 : 1,
            transition: "transform 0.3s ease",
          }}
          className="group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/default-product.png";
          }}
        />

        {/* Stock Badge */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            insetInlineStart: "12px",
            backgroundColor: stockBg,
            backdropFilter: "blur(4px)",
            padding: "4px 8px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 600,
            color: stockColor,
            border: `1px solid ${stockColor}22`,
            display: "flex",
            alignItems: "center",
            lineHeight: 1,
            zIndex: 10,
          }}
        >
          {isOutOfStock ? t("pos.out_of_stock") : t("pos.in_stock", { count: totalStock })}
        </div>
      </div>

      {/* Product Info */}
      <div
        style={{
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        <div style={{ flexGrow: 1 }}>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "var(--color-on-surface)",
              margin: 0,
              marginBottom: "4px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.3,
            }}
          >
            {product.name}
          </h3>
          
          {product.category?.name && (
            <p
              style={{
                fontSize: "13px",
                color: "var(--color-secondary)",
                opacity: 0.7,
                margin: 0,
                marginBottom: "12px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {product.category.name}
            </p>
          )}
        </div>

        {/* Price & Action Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--color-primary)",
              direction: "ltr",
            }}
          >
            {formatCurrency(product.price)}
          </span>

          <button
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              backgroundColor: isOutOfStock ? "var(--color-surface-variant)" : "var(--color-primary)",
              color: isOutOfStock ? "var(--color-on-surface-variant)" : "#1A1A1A",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: isOutOfStock ? "not-allowed" : "pointer",
              transition: "transform 0.15s ease, opacity 0.15s ease, background-color 0.15s ease",
              opacity: isOutOfStock ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isOutOfStock) {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.backgroundColor = "#e0be4d"; // slightly lighter gold
              }
            }}
            onMouseLeave={(e) => {
              if (!isOutOfStock) {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.backgroundColor = "var(--color-primary)";
              }
            }}
            onMouseDown={(e) => {
              if (!isOutOfStock) e.currentTarget.style.transform = "scale(0.95)";
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px", fontWeight: 600 }}>
              add
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
