import { ShoppingCart, Trash2 } from "lucide-react";
import { useCartStore, cartSelectors } from "@/store/cartStore";
import { CartItemRow } from "./CartItemRow";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CartPanelProps {
  onCheckout: () => void;
}

export function CartPanel({ onCheckout }: CartPanelProps) {
  const items = useCartStore((s) => s.items);
  const cartDiscount = useCartStore((s) => s.cartDiscount);
  const setCartDiscount = useCartStore((s) => s.setCartDiscount);
  const clearCart = useCartStore((s) => s.clearCart);

  const subtotal = useCartStore(cartSelectors.subtotal);
  const totalItemDiscounts = useCartStore(cartSelectors.totalItemDiscounts);
  const total = useCartStore(cartSelectors.total);
  const itemCount = useCartStore(cartSelectors.itemCount);
  const isEmpty = useCartStore(cartSelectors.isEmpty);

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-surface)]">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <ShoppingCart className="w-4 h-4 text-[var(--color-accent)]" />
          <span className="text-[15px] font-bold text-[var(--color-text-primary)] tracking-wide">
            Panier
          </span>
          {!isEmpty && (
            <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-[var(--color-accent)] text-white rounded-full leading-none">
              {itemCount}
            </span>
          )}
        </div>

        {!isEmpty && (
          <button
            onClick={clearCart}
            className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Vider
          </button>
        )}
      </div>

      {/* ── Items ── */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--color-text-muted)] px-6">
            <div className="w-16 h-16 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Panier vide</p>
              <p className="text-xs mt-1">
                Cliquez sur un produit pour l'ajouter
              </p>
            </div>
          </div>
        ) : (
          <div>
            {items.map((item) => (
              <CartItemRow key={item.variantId} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* ── Totals ── */}
      {!isEmpty && (
        <div className="border-t border-[var(--color-border)] px-4 py-3 space-y-2">
          {/* Subtotal */}
          <div className="flex justify-between text-sm text-[var(--color-text-secondary)]">
            <span>Sous-total</span>
            <span className="tabular-nums">{formatCurrency(subtotal)}</span>
          </div>

          {/* Item-level discounts */}
          {totalItemDiscounts > 0 && (
            <div className="flex justify-between text-sm text-[var(--color-warning)]">
              <span>Remises articles</span>
              <span className="tabular-nums">
                −{formatCurrency(totalItemDiscounts)}
              </span>
            </div>
          )}

          {/* Global cart discount */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-[var(--color-text-secondary)] shrink-0">
              Remise panier
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={0}
                value={cartDiscount || ""}
                placeholder="0"
                onChange={(e) =>
                  setCartDiscount(parseFloat(e.target.value) || 0)
                }
                className={cn(
                  "w-24 h-7 px-2 text-right text-sm tabular-nums",
                  "bg-[var(--color-bg-surface)] border border-[var(--color-border)]",
                  "rounded-[var(--radius-sm)] text-[var(--color-text-primary)] shadow-[var(--shadow-xs)]",
                  "focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10",
                  "hover:border-[var(--color-border-strong)]"
                )}
              />
              <span className="text-xs text-[var(--color-text-muted)]">DZD</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--color-border)] pt-3 mt-1">
            <div className="flex justify-between items-baseline bg-[var(--color-bg-subtle)] p-3 rounded-[var(--radius-lg)] border border-[var(--color-border)]/50">
              <span className="text-base font-extrabold text-[var(--color-text-primary)]">
                Total
              </span>
              <span className="text-2xl font-extrabold text-[var(--color-accent)] tabular-nums tracking-tight">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Checkout Button ── */}
      <div className="px-4 pb-4 pt-2">
        <Button
          variant="primary"
          size="lg"
          className="w-full gap-2 text-base font-bold"
          disabled={isEmpty}
          onClick={onCheckout}
        >
          <span>Payer</span>
          {!isEmpty && (
            <span className="opacity-70 text-sm font-normal">
              {formatCurrency(total)}
            </span>
          )}
          <kbd className="ml-auto text-[10px] opacity-50 bg-white/10 px-1.5 py-0.5 rounded">
            F9
          </kbd>
        </Button>
      </div>
    </div>
  );
}
