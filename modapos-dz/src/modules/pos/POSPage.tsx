import { useState, useCallback, useEffect } from "react";
import { usePOSSearch } from "./hooks/usePOSSearch";
import { useCategories } from "@/modules/products/hooks/useCategories";
import { ProductSearch } from "./components/ProductSearch";
import { ProductGrid } from "./components/ProductGrid";
import { CartPanel } from "./components/CartPanel";
import { VariantPicker } from "./components/VariantPicker";
import { CheckoutModal } from "./components/CheckoutModal";
import { useCartStore, cartSelectors } from "@/store/cartStore";
import { useKeyboard } from "@/hooks/useKeyboard";
import type { Product } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/modules/auth/AuthContext";
import { useIPC } from "@/hooks/useIPC";
import { OpenSessionModal } from "@/modules/cashRegister/components/OpenSessionModal";
import { toastSuccess, toastError } from "@/components/ui/toast";

export function POSPage() {
  const { query, setQuery, products, isSearching, clearSearch, categoryId, setCategoryId } = usePOSSearch();
  const { categories } = useCategories();
  const isEmpty = useCartStore(cartSelectors.isEmpty);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { t, isRtl } = useTranslation();

  const { user } = useAuth();
  const api = useIPC();
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [isActiveLoading, setIsActiveLoading] = useState(false);
  const [isOpenSessionOpen, setIsOpenSessionOpen] = useState(false);

  const fetchActiveSession = useCallback(async () => {
    if (!user) return;
    setIsActiveLoading(true);
    try {
      const session = await api<any>("cashRegister:getActiveSession", { userId: user.id });
      setActiveSession(session);
    } catch (err) {
      console.error("Failed to load active session:", err);
    } finally {
      setIsActiveLoading(false);
    }
  }, [user, api]);

  useEffect(() => {
    fetchActiveSession();
  }, [fetchActiveSession]);

  const handleOpenSessionSubmit = async (openingBalance: number, notes?: string) => {
    if (!user) return false;
    try {
      await api("cashRegister:openSession", { userId: user.id, openingBalance, notes });
      toastSuccess(t("cashRegister.toasts.open_success", { defaultValue: "Caisse ouverte avec succès !" }));
      await fetchActiveSession();
      return true;
    } catch (err: any) {
      toastError(err.message || t("cashRegister.toasts.error_open", { defaultValue: "Erreur lors de l'ouverture de la caisse" }));
      return false;
    }
  };

  const handleEnterOnSearch = useCallback(() => {
    if (products.length === 1) {
      const product = products[0];
      const activeVariants = product.variants.filter((v) => v.stock > 0);
      if (activeVariants.length >= 1) {
        setSelectedProduct(product);
      }
    } else if (products.length > 1) {
      setSelectedProduct(products[0]);
    }
  }, [products]);

  const openCheckout = useCallback(() => {
    if (!isEmpty) setIsCheckoutOpen(true);
  }, [isEmpty]);

  useKeyboard({
    F1: (e) => {
      e.preventDefault();
      const el = document.getElementById("pos-search") as HTMLInputElement | null;
      el?.focus();
      el?.select();
    },
    F9: (e) => {
      e.preventDefault();
      openCheckout();
    },
    Escape: () => {
      if (isCheckoutOpen) return;
      if (selectedProduct) { setSelectedProduct(null); return; }
      clearSearch();
    },
  });

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", flexDirection: isRtl ? "row-reverse" : "row" }}>
      {/* ── Left: Product panel ── */}
      <section
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* Session Warning Banner */}
        {!activeSession && !isActiveLoading && (
          <div
            style={{
              background: "rgba(186,26,26,0.06)",
              borderBottom: "1.5px solid rgba(186,26,26,0.15)",
              padding: "10px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexDirection: isRtl ? "row-reverse" : "row",
              fontSize: 13,
              color: "var(--color-error)",
              fontWeight: 500,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>warning</span>
              <span>
                {t("cashRegister.toasts.error_no_session", { defaultValue: "Veuillez d'abord ouvrir la caisse." })} Les ventes en espèces seront bloquées.
              </span>
            </div>
            <button
              onClick={() => setIsOpenSessionOpen(true)}
              style={{
                background: "var(--color-error)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius-md)",
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "var(--font-body)",
                boxShadow: "var(--shadow-soft)",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>lock_open</span>
              {t("cashRegister.open_modal.title", { defaultValue: "Ouvrir la caisse" })}
            </button>
          </div>
        )}

        {/* Search + filter bar */}
        <div
          style={{
            position: "sticky",
            top: 0,
            background: "rgba(251,249,244,0.9)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            zIndex: 20,
            padding: "16px var(--space-container) 16px",
            borderBottom: "1px solid rgba(208,197,175,0.2)",
          }}
        >
          {/* Search input */}
          <div style={{ position: "relative", maxWidth: 640, marginBottom: "24px" }}>
            <span
              className="material-symbols-outlined"
              style={{
                position: "absolute",
                left: isRtl ? "auto" : 16,
                right: isRtl ? 16 : "auto",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-on-surface-variant)",
                fontSize: 22,
                pointerEvents: "none",
              }}
            >
              search
            </span>
            <ProductSearch
              query={query}
              onChange={setQuery}
              onClear={clearSearch}
              onEnter={handleEnterOnSearch}
            />
          </div>

          {/* Category chips — driven from DB */}
          <div
            style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px", flexDirection: isRtl ? "row-reverse" : "row" }}
          >
            {/* "All products" chip */}
            <button
              onClick={() => setCategoryId(undefined)}
              className={`chip ${categoryId === undefined ? "chip-active" : "chip-default"}`}
              style={{ whiteSpace: "nowrap", cursor: "pointer", border: "none", fontFamily: "var(--font-body)" }}
            >
              {t("products.categories.all")}
            </button>

            {/* DB category chips */}
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id === categoryId ? undefined : cat.id)}
                className={`chip ${cat.id === categoryId ? "chip-active" : "chip-default"}`}
                style={{ whiteSpace: "nowrap", cursor: "pointer", border: "none", fontFamily: "var(--font-body)" }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        <div
          style={{ flex: 1, overflowY: "auto", padding: "var(--space-container)" }}
          className="no-scrollbar"
        >
          <ProductGrid
            products={products}
            isSearching={isSearching}
            query={query}
            onVariantNeeded={setSelectedProduct}
          />
        </div>
      </section>

      {/* ── Right: Cart panel ── */}
      <CartPanel onCheckout={openCheckout} />

      {/* ── Variant picker modal ── */}
      <VariantPicker product={selectedProduct} onClose={() => setSelectedProduct(null)} />

      {/* ── Checkout modal ── */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        activeSession={activeSession}
        isActiveLoading={isActiveLoading}
        onSessionOpened={(session) => setActiveSession(session)}
      />

      {/* ── Open session modal ── */}
      <OpenSessionModal
        isOpen={isOpenSessionOpen}
        onClose={() => setIsOpenSessionOpen(false)}
        onSubmit={handleOpenSessionSubmit}
      />
    </div>
  );
}

