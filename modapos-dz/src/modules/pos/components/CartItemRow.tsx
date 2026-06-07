import { Minus, Plus, Trash2, Package } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import type { CartItem } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { t, isRtl } = useTranslation();
  const { removeItem, updateQuantity, updateItemDiscount } = useCartStore();

  const rowTotal = item.unitPrice * item.quantity - item.discount;

  return (
    <div className="px-3 py-3 flex flex-col gap-2 border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-elevated)] transition-colors">
      {/* Row 1: Image + Name + Delete */}
      <div className="flex items-start gap-2.5">
        {/* Thumbnail */}
        <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--color-bg-overlay)] flex items-center justify-center shrink-0 overflow-hidden border border-[var(--color-border)]">
          {item.imagePath ? (
            <img
              src={`media://${item.imagePath}`}
              alt={item.productName}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          )}
        </div>

        {/* Name + variant */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--color-text-primary)] leading-tight truncate">
            {item.productName}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {item.size} / {item.color}
          </p>
        </div>

        {/* Delete */}
        <button
          onClick={() => removeItem(item.variantId)}
          className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)] transition-colors shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Row 2: Price × Qty + Discount + Total */}
      <div className={cn("flex items-center gap-2", isRtl ? "pr-10" : "pl-10")}>
        {/* Unit price */}
        <span className="text-xs text-[var(--color-text-muted)] tabular-nums shrink-0">
          {formatCurrency(item.unitPrice)}
        </span>

        {/* Qty controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className={cn(
              "w-6 h-6 flex items-center justify-center rounded-[var(--radius-sm)]",
              "border border-[var(--color-border)] text-[var(--color-text-secondary)]",
              "hover:bg-[var(--color-bg-overlay)] transition-colors",
              "disabled:opacity-30 disabled:cursor-not-allowed"
            )}
          >
            <Minus className="w-3 h-3" />
          </button>

          <input
            type="number"
            min={1}
            max={item.maxStock}
            value={item.quantity}
            onChange={(e) =>
              updateQuantity(item.variantId, parseInt(e.target.value) || 1)
            }
            className="w-10 h-6 text-center text-xs font-semibold text-[var(--color-text-primary)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--color-accent)]"
          />

          <button
            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
            disabled={item.quantity >= item.maxStock}
            className={cn(
              "w-6 h-6 flex items-center justify-center rounded-[var(--radius-sm)]",
              "border border-[var(--color-border)] text-[var(--color-text-secondary)]",
              "hover:bg-[var(--color-bg-overlay)] transition-colors",
              "disabled:opacity-30 disabled:cursor-not-allowed"
            )}
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Row total */}
        <span
          className={cn(
            "text-sm font-semibold tabular-nums",
            item.discount > 0
              ? "text-[var(--color-accent)]"
              : "text-[var(--color-text-primary)]"
          )}
        >
          {formatCurrency(rowTotal)}
        </span>
      </div>

      {/* Row 3: Discount input (subtle) */}
      <div className={cn("flex items-center gap-2", isRtl ? "pr-10" : "pl-10")}>
        <label className="text-[10px] text-[var(--color-text-muted)] shrink-0">
          {t("pos.cart.discount")}:
        </label>
        <input
          type="number"
          min={0}
          value={item.discount || ""}
          placeholder="0"
          onChange={(e) =>
            updateItemDiscount(
              item.variantId,
              parseFloat(e.target.value) || 0
            )
          }
          className="w-20 h-5 px-1.5 text-xs text-[var(--color-text-secondary)] bg-[var(--color-bg-overlay)] border border-[var(--color-border)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--color-accent)] tabular-nums"
        />
        <span className="text-[10px] text-[var(--color-text-muted)]">DZD</span>
      </div>
    </div>
  );
}
