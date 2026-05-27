import { useCartStore, cartSelectors } from "@/store/cartStore";
import { CartItemRow } from "./CartItemRow";
import { formatCurrency } from "@/lib/utils";

interface CartPanelProps {
  onCheckout: () => void;
}

export function CartPanel({ onCheckout }: CartPanelProps) {
  const items = useCartStore((s) => s.items);
  const cartDiscount = useCartStore((s) => s.cartDiscount);
  const clearCart = useCartStore((s) => s.clearCart);

  const subtotal = useCartStore(cartSelectors.subtotal);
  const totalItemDiscounts = useCartStore(cartSelectors.totalItemDiscounts);
  const total = useCartStore(cartSelectors.total);
  const isEmpty = useCartStore(cartSelectors.isEmpty);


  return (
    <aside className="cart-panel">
      {/* ── Header ── */}
      <div
        style={{
          padding: "24px",
          borderBottom: "1px solid rgba(208,197,175,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-headline-md)",
            fontWeight: 600,
            color: "var(--color-on-surface)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          Ticket de Caisse
          {!isEmpty && (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--color-primary-container)",
                display: "inline-block",
              }}
            />
          )}
        </h2>
        <button
          onClick={clearCart}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>more_vert</span>
        </button>
      </div>

      {/* ── Client association ── */}
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid rgba(208,197,175,0.1)",
        }}
      >
        <button
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            borderRadius: "var(--radius-lg)",
            background: "var(--color-surface-container-low)",
            border: "1px solid rgba(208,197,175,0.2)",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: "var(--color-on-surface-variant)",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>person_add</span>
            <span
              style={{
                fontSize: "var(--text-label-md)",
                fontWeight: "var(--fw-label-md)",
                letterSpacing: "var(--ls-label-md)",
                fontFamily: "var(--font-body)",
              }}
            >
              Associer un client
            </span>
          </div>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-outline)" }}>
            chevron_right
          </span>
        </button>
      </div>

      {/* ── Cart items ── */}
      <div
        style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}
        className="no-scrollbar"
      >
        {isEmpty ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              gap: "12px",
              color: "var(--color-secondary)",
              textAlign: "center",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.3 }}>
              shopping_cart
            </span>
            <p style={{ fontSize: "var(--text-body-sm)" }}>Panier vide</p>
            <p style={{ fontSize: "var(--text-body-sm)", opacity: 0.7 }}>
              Cliquez sur un produit pour l'ajouter
            </p>
          </div>
        ) : (
          items.map((item) => <CartItemRow key={item.variantId} item={item} />)
        )}
      </div>

      {/* ── Summary + checkout ── */}
      {!isEmpty && (
        <div
          style={{
            padding: "24px",
            background: "var(--color-surface-container-low)",
            borderTop: "1px solid rgba(208,197,175,0.2)",
            borderRadius: "24px 24px 0 0",
            boxShadow: "0 -10px 30px rgba(0,0,0,0.03)",
          }}
        >
          {/* Line items */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-body-sm)", color: "var(--color-secondary)" }}>
              <span>Sous-total</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {totalItemDiscounts > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-body-sm)", color: "var(--color-secondary)" }}>
                <span>Remises articles</span>
                <span>−{formatCurrency(totalItemDiscounts)}</span>
              </div>
            )}
            {cartDiscount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-body-sm)", color: "var(--color-secondary)" }}>
                <span>Remise panier</span>
                <span>−{formatCurrency(cartDiscount)}</span>
              </div>
            )}

            {/* Total TTC */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginTop: "8px",
                paddingTop: "16px",
                borderTop: "1px solid rgba(208,197,175,0.2)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "18px",
                  fontWeight: 500,
                  color: "var(--color-on-surface)",
                }}
              >
                Total
              </span>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "var(--color-on-surface)",
                  letterSpacing: "-0.02em",
                }}
              >
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button
              onClick={onCheckout}
              style={{
                width: "100%",
                height: 56,
                background: "var(--color-charcoal)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius-lg)",
                fontSize: "16px",
                fontWeight: "var(--fw-label-md)",
                letterSpacing: "var(--ls-label-md)",
                fontFamily: "var(--font-body)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: "pointer",
                boxShadow: "var(--shadow-soft)",
              }}
            >
              Encaisser
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
            </button>
            <button
              style={{
                width: "100%",
                height: 48,
                background: "transparent",
                color: "var(--color-primary-container)",
                border: "1px solid rgba(212,175,55,0.5)",
                borderRadius: "var(--radius-lg)",
                fontSize: "var(--text-label-md)",
                fontWeight: "var(--fw-label-md)",
                letterSpacing: "var(--ls-label-md)",
                fontFamily: "var(--font-body)",
                cursor: "pointer",
              }}
            >
              Mettre en attente
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
