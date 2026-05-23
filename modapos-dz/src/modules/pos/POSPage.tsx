import { useState, useCallback } from "react";
import { ShoppingBag } from "lucide-react";
import { usePOSSearch } from "./hooks/usePOSSearch";
import { ProductSearch } from "./components/ProductSearch";
import { ProductGrid } from "./components/ProductGrid";
import { CartPanel } from "./components/CartPanel";
import { VariantPicker } from "./components/VariantPicker";
import { CheckoutModal } from "./components/CheckoutModal";
import { useCartStore, cartSelectors } from "@/store/cartStore";
import { useKeyboard } from "@/hooks/useKeyboard";
import type { Product } from "@/types";

export function POSPage() {
  const { query, setQuery, products, isSearching, clearSearch } = usePOSSearch();

  const isEmpty = useCartStore(cartSelectors.isEmpty);

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Auto-add: if search finds exactly 1 product with 1 variant → add it
  const handleEnterOnSearch = useCallback(() => {
    if (products.length === 1) {
      const product = products[0];
      const activeVariants = product.variants.filter((v) => v.stock > 0);
      if (activeVariants.length === 1) {
        setSelectedProduct(product);
        // VariantPicker will handle adding and closing
      } else if (activeVariants.length > 1) {
        setSelectedProduct(product);
      }
    } else if (products.length > 1) {
      setSelectedProduct(products[0]);
    }
  }, [products]);

  const openCheckout = useCallback(() => {
    if (!isEmpty) setIsCheckoutOpen(true);
  }, [isEmpty]);

  // ── Keyboard shortcuts ────────────────────────────────────
  useKeyboard({
    // F1 → focus search bar
    F1: (e) => {
      e.preventDefault();
      const el = document.getElementById("pos-search") as HTMLInputElement | null;
      el?.focus();
      el?.select();
    },
    // F9 → open checkout
    F9: (e) => {
      e.preventDefault();
      openCheckout();
    },
    // Escape → close modals or clear search
    Escape: () => {
      if (isCheckoutOpen) return; // let the modal handle it
      if (selectedProduct) {
        setSelectedProduct(null);
        return;
      }
      clearSearch();
    },
  });

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left: Product panel ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* POS top bar */}
        <div className="px-4 pt-4 pb-3 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[0_1px_0_0_var(--color-border)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[var(--color-accent)]" />
              <span className="font-semibold text-[var(--color-text-primary)]">
                Caisse
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
              <kbd className="px-1.5 py-0.5 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] border-b-2 rounded text-[10px] text-[var(--color-text-secondary)] shadow-[var(--shadow-xs)]">
                F1
              </kbd>
              <span>Recherche</span>
              <span className="mx-1">·</span>
              <kbd className="px-1.5 py-0.5 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] border-b-2 rounded text-[10px] text-[var(--color-text-secondary)] shadow-[var(--shadow-xs)]">
                F9
              </kbd>
              <span>Payer</span>
            </div>
          </div>

          <ProductSearch
            query={query}
            onChange={setQuery}
            onClear={clearSearch}
            isSearching={isSearching}
            onEnter={handleEnterOnSearch}
          />
        </div>

        {/* Product grid — scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          <ProductGrid
            products={products}
            isSearching={isSearching}
            query={query}
            onVariantNeeded={setSelectedProduct}
          />
        </div>
      </div>

      {/* ── Right: Cart panel (fixed width) ── */}
      <div className="w-[360px] shrink-0 border-l border-[var(--color-border)] flex flex-col overflow-hidden">
        <CartPanel onCheckout={openCheckout} />
      </div>

      {/* ── Variant picker modal ── */}
      <VariantPicker
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* ── Checkout modal ── */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </div>
  );
}
