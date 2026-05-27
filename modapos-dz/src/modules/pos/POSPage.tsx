import { useState, useCallback } from "react";
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

export function POSPage() {
  const { query, setQuery, products, isSearching, clearSearch, categoryId, setCategoryId } = usePOSSearch();
  const { categories } = useCategories();
  const isEmpty = useCartStore(cartSelectors.isEmpty);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

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
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
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
                left: 16,
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
              isSearching={isSearching}
              onEnter={handleEnterOnSearch}
            />
          </div>

          {/* Category chips — driven from DB */}
          <div
            style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px" }}
            className="no-scrollbar"
          >
            {/* "All products" chip */}
            <button
              onClick={() => setCategoryId(undefined)}
              className={`chip ${categoryId === undefined ? "chip-active" : "chip-default"}`}
              style={{ whiteSpace: "nowrap", cursor: "pointer", border: "none", fontFamily: "var(--font-body)" }}
            >
              Tous les produits
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
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </div>
  );
}
