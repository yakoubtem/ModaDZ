import { useState, useEffect, useRef } from "react";
import { useCartStore, cartSelectors } from "@/store/cartStore";
import { CartItemRow } from "./CartItemRow";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { useIPC } from "@/hooks/useIPC";
import type { Customer } from "@/types";

interface CartPanelProps {
  onCheckout: () => void;
}

export function CartPanel({ onCheckout }: CartPanelProps) {
  const items = useCartStore((s) => s.items);
  const cartDiscount = useCartStore((s) => s.cartDiscount);
  const clearCart = useCartStore((s) => s.clearCart);
  const selectedCustomer = useCartStore((s) => s.selectedCustomer);
  const setSelectedCustomer = useCartStore((s) => s.setSelectedCustomer);
  const api = useIPC();

  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const customerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Search debounce
  useEffect(() => {
    if (!customerQuery.trim()) {
      setCustomerResults([]);
      return;
    }
    if (customerTimerRef.current) clearTimeout(customerTimerRef.current);
    customerTimerRef.current = setTimeout(async () => {
      try {
        const results = await api<Customer[]>("customers:search", customerQuery);
        setCustomerResults(results);
        setShowCustomerDropdown(true);
      } catch {
        /* silent */
      }
    }, 250);
    return () => {
      if (customerTimerRef.current) clearTimeout(customerTimerRef.current);
    };
  }, [customerQuery, api]);

  // Click outside dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
        setIsSearchingCustomer(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const subtotal = useCartStore(cartSelectors.subtotal);
  const totalItemDiscounts = useCartStore(cartSelectors.totalItemDiscounts);
  const total = useCartStore(cartSelectors.total);
  const isEmpty = useCartStore(cartSelectors.isEmpty);

  const { t, isRtl } = useTranslation();

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
          flexDirection: isRtl ? "row-reverse" : "row",
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
            flexDirection: isRtl ? "row-reverse" : "row",
          }}
        >
          {t("pos.cart.title")}
          {!isEmpty && (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--color-primary)",
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
      {selectedCustomer ? (
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid rgba(208,197,175,0.1)",
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 12px",
              borderRadius: "var(--radius-lg)",
              background: "rgba(212, 175, 55, 0.08)",
              border: "1px solid rgba(212, 175, 55, 0.25)",
              flexDirection: isRtl ? "row-reverse" : "row",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexDirection: isRtl ? "row-reverse" : "row",
                cursor: "pointer",
                flex: 1,
              }}
              onClick={() => {
                setIsSearchingCustomer(true);
                setCustomerQuery(selectedCustomer.name);
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--color-primary)" }}>person</span>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: isRtl ? "right" : "left" }}>
                <span
                  style={{
                    fontSize: "var(--text-label-md)",
                    fontWeight: 700,
                    color: "var(--color-on-surface)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {selectedCustomer.name}
                </span>
                {selectedCustomer.phone && (
                  <span style={{ fontSize: 11, color: "var(--color-secondary)", marginTop: 1 }}>
                    {selectedCustomer.phone}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelectedCustomer(null)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-secondary)",
                display: "flex",
                alignItems: "center",
                padding: 4,
                borderRadius: "50%",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
            </button>
          </div>
        </div>
      ) : isSearchingCustomer ? (
        <div
          ref={dropdownRef}
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid rgba(208,197,175,0.1)",
            position: "relative",
          }}
        >
          <div style={{ position: "relative" }}>
            <span
              className="material-symbols-outlined"
              style={{
                position: "absolute",
                [isRtl ? "right" : "left"]: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-outline)",
                fontSize: 18,
              }}
            >
              search
            </span>
            <input
              autoFocus
              type="text"
              placeholder={t("pos.checkout_modal.search_customer_placeholder")}
              value={customerQuery}
              onChange={(e) => setCustomerQuery(e.target.value)}
              style={{
                width: "100%",
                height: 40,
                background: "var(--color-surface-container-low)",
                border: "1px solid rgba(208,197,175,0.3)",
                borderRadius: "var(--radius-lg)",
                paddingLeft: isRtl ? 12 : 36,
                paddingRight: isRtl ? 36 : 12,
                fontSize: "var(--text-body-sm)",
                fontFamily: "var(--font-body)",
                color: "var(--color-on-surface)",
                outline: "none",
              }}
            />
            {customerQuery && (
              <button
                onClick={() => { setCustomerQuery(""); setCustomerResults([]); }}
                style={{
                  position: "absolute",
                  [isRtl ? "left" : "right"]: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-secondary)",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
              </button>
            )}
          </div>

          {showCustomerDropdown && (
            <div
              style={{
                position: "absolute",
                left: 24,
                right: 24,
                top: "100%",
                zIndex: 100,
                background: "var(--color-surface-container-lowest)",
                border: "1px solid var(--color-outline-variant)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-elevated)",
                maxHeight: 200,
                overflowY: "auto",
                marginTop: 4,
              }}
            >
              {customerResults.length > 0 ? (
                customerResults.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomer(c);
                      setIsSearchingCustomer(false);
                      setCustomerQuery("");
                      setShowCustomerDropdown(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-[var(--color-bg-overlay)] transition-colors"
                    style={{
                      border: "none",
                      borderBottom: "1px solid rgba(208,197,175,0.15)",
                      cursor: "pointer",
                      textAlign: isRtl ? "right" : "left",
                      flexDirection: isRtl ? "row-reverse" : "row",
                    }}
                  >
                    <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-on-surface)" }}>
                      {c.name}
                    </span>
                    {c.phone && (
                      <span style={{ fontSize: 12, color: "var(--color-secondary)" }}>
                        {c.phone}
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <div style={{ padding: "12px", textAlign: "center", fontStyle: "italic", fontSize: 12, color: "var(--color-secondary)" }}>
                  {t("pos.checkout_modal.no_customer_found")}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid rgba(208,197,175,0.1)",
          }}
        >
          <button
            onClick={() => setIsSearchingCustomer(true)}
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
              flexDirection: isRtl ? "row-reverse" : "row",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "var(--color-on-surface-variant)",
                flexDirection: isRtl ? "row-reverse" : "row",
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
                {t("pos.cart.customer_select")}
              </span>
            </div>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-outline)" }}>
              {isRtl ? "chevron_left" : "chevron_right"}
            </span>
          </button>
        </div>
      )}

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
            <p style={{ fontSize: "var(--text-body-sm)" }}>{t("pos.cart.empty")}</p>
            <p style={{ fontSize: "var(--text-body-sm)", opacity: 0.7 }}>
              {t("pos.cart.click_to_add")}
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
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-body-sm)", color: "var(--color-secondary)", flexDirection: isRtl ? "row-reverse" : "row" }}>
              <span>{t("pos.cart.subtotal")}</span>
              <span style={{ direction: "ltr" }}>{formatCurrency(subtotal)}</span>
            </div>
            {totalItemDiscounts > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-body-sm)", color: "var(--color-secondary)", flexDirection: isRtl ? "row-reverse" : "row" }}>
                <span>{t("pos.cart.item_discounts")}</span>
                <span style={{ direction: "ltr" }}>−{formatCurrency(totalItemDiscounts)}</span>
              </div>
            )}
            {cartDiscount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-body-sm)", color: "var(--color-secondary)", flexDirection: isRtl ? "row-reverse" : "row" }}>
                <span>{t("pos.cart.discount")}</span>
                <span style={{ direction: "ltr" }}>−{formatCurrency(cartDiscount)}</span>
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
                flexDirection: isRtl ? "row-reverse" : "row",
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
                {t("pos.cart.total")}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "var(--color-on-surface)",
                  letterSpacing: "-0.02em",
                  direction: "ltr",
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
                flexDirection: isRtl ? "row-reverse" : "row",
                cursor: "pointer",
                boxShadow: "var(--shadow-soft)",
              }}
            >
              {t("pos.cart.checkout")}
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                {isRtl ? "arrow_back" : "arrow_forward"}
              </span>
            </button>
            <button
              className="btn-outline"
              style={{
                width: "100%",
                height: 48,
                justifyContent: "center",
              }}
            >
              {t("pos.cart.suspend")}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
