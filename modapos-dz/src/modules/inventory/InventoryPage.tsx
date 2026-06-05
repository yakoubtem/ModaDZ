import { useState, useCallback, useEffect } from "react";
import { TopBar } from "@/components/layout/AppLayout";
import { useIPC } from "@/hooks/useIPC";
import { formatCurrency } from "@/lib/utils";
import { toastSuccess, toastError } from "@/components/ui/toast";

interface InventoryVariant {
  id: number;
  size: string;
  color: string;
  stock: number;
  barcode?: string | null;
  productId: number;
  product: {
    id: number;
    name: string;
    sku: string;
    price: number;
    category?: { id: number; name: string } | null;
  };
}

type StockFilter = "all" | "low" | "out";

const LOW_STOCK_THRESHOLD = 5;

export function InventoryPage() {
  const api = useIPC();
  const [variants, setVariants] = useState<InventoryVariant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [adjustingId, setAdjustingId] = useState<number | null>(null);
  const [adjustValue, setAdjustValue] = useState("");

  const fetchInventory = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api<InventoryVariant[]>("inventory:getAll");
      setVariants(data || []);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleAdjust = async (variantId: number) => {
    const delta = parseInt(adjustValue, 10);
    if (isNaN(delta)) return;
    try {
      await api("inventory:adjust", variantId, delta);
      setVariants((prev) =>
        prev.map((v) => (v.id === variantId ? { ...v, stock: Math.max(0, v.stock + delta) } : v))
      );
      toastSuccess("Stock mis à jour", `Ajustement de ${delta > 0 ? "+" : ""}${delta} appliqué.`);
    } catch {
      toastError("Erreur", "Impossible de mettre à jour le stock.");
    } finally {
      setAdjustingId(null);
      setAdjustValue("");
    }
  };

  // Filtered variants
  const filtered = variants.filter((v) => {
    const matchSearch =
      !search ||
      v.product.name.toLowerCase().includes(search.toLowerCase()) ||
      v.product.sku.toLowerCase().includes(search.toLowerCase()) ||
      (v.barcode ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStock =
      stockFilter === "all" ||
      (stockFilter === "low" && v.stock > 0 && v.stock <= LOW_STOCK_THRESHOLD) ||
      (stockFilter === "out" && v.stock === 0);
    return matchSearch && matchStock;
  });

  const totalItems = variants.reduce((s, v) => s + v.stock, 0);
  const lowStockCount = variants.filter((v) => v.stock > 0 && v.stock <= LOW_STOCK_THRESHOLD).length;
  const outOfStockCount = variants.filter((v) => v.stock === 0).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopBar title="Inventaire" description="Gestion des stocks par variante de produit." />

      <main
        style={{
          padding: "var(--space-container)",
          maxWidth: 1440,
          margin: "0 auto",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-section)",
        }}
        className="animate-fade-in"
      >
        {/* KPI row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "var(--space-card-gap)",
          }}
        >
          {[
            {
              label: "Unités en stock",
              value: isLoading ? "—" : totalItems.toLocaleString("fr-DZ"),
              icon: "inventory_2",
              error: false,
            },
            {
              label: "Stocks bas",
              value: isLoading ? "—" : lowStockCount.toLocaleString("fr-DZ"),
              icon: "warning",
              error: lowStockCount > 0,
              sub: `≤ ${LOW_STOCK_THRESHOLD} unités`,
            },
            {
              label: "Ruptures de stock",
              value: isLoading ? "—" : outOfStockCount.toLocaleString("fr-DZ"),
              icon: "remove_shopping_cart",
              error: outOfStockCount > 0,
              sub: "0 unité",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="glass-panel"
              style={{
                padding: "24px",
                borderRadius: "var(--radius-xl)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--color-secondary)" }}>
                <span style={{ fontSize: "var(--text-label-md)", fontWeight: "var(--fw-label-md)", letterSpacing: "var(--ls-label-md)" }}>
                  {card.label}
                </span>
                <span className="material-symbols-outlined" style={{ color: card.error ? "var(--color-error)" : "inherit" }}>
                  {card.icon}
                </span>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-display-lg)",
                  fontWeight: "var(--fw-display-lg)",
                  color: card.error ? "var(--color-error)" : "var(--color-on-surface)",
                  marginTop: "8px",
                }}
              >
                {card.value}
              </div>
              {card.sub && (
                <div style={{ fontSize: "var(--text-label-sm)", color: card.error ? "var(--color-error)" : "var(--color-secondary)" }}>
                  {card.sub}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="glass-panel" style={{ borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
          {/* Controls */}
          <div
            style={{
              padding: "24px",
              borderBottom: "1px solid rgba(208,197,175,0.3)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "rgba(255,255,255,0.5)",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            {/* Search */}
            <div style={{ position: "relative", flex: 1, minWidth: 240, maxWidth: 480 }}>
              <span
                className="material-symbols-outlined"
                style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--color-secondary)", fontSize: 22, pointerEvents: "none" }}
              >
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par produit, SKU ou code-barres…"
                style={{
                  width: "100%",
                  height: 48,
                  paddingLeft: 48,
                  paddingRight: 16,
                  background: "var(--color-surface)",
                  border: "1px solid rgba(208,197,175,0.3)",
                  borderRadius: "var(--radius-lg)",
                  fontSize: "var(--text-body-sm)",
                  fontFamily: "var(--font-body)",
                  color: "var(--color-on-surface)",
                  outline: "none",
                }}
              />
            </div>

            {/* Stock filter tabs */}
            <div
              style={{
                display: "flex",
                gap: 4,
                background: "var(--color-surface-container-high)",
                borderRadius: "var(--radius-lg)",
                padding: 4,
              }}
            >
              {([
                { value: "all", label: "Tous", count: variants.length },
                { value: "low", label: "Stocks bas", count: lowStockCount },
                { value: "out", label: "Ruptures", count: outOfStockCount },
              ] as { value: StockFilter; label: string; count: number }[]).map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStockFilter(tab.value)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "none",
                    fontSize: "var(--text-label-sm)",
                    fontWeight: "var(--fw-label-sm)",
                    fontFamily: "var(--font-body)",
                    cursor: "pointer",
                    background: stockFilter === tab.value ? "var(--color-surface-container-lowest)" : "transparent",
                    color: stockFilter === tab.value ? "var(--color-on-surface)" : "var(--color-secondary)",
                    boxShadow: stockFilter === tab.value ? "var(--shadow-soft)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      style={{
                        background: tab.value === "out" && tab.count > 0 ? "var(--color-error)" : tab.value === "low" && tab.count > 0 ? "#f59e0b" : "var(--color-outline-variant)",
                        color: tab.count > 0 && tab.value !== "all" ? "white" : "var(--color-secondary)",
                        borderRadius: "999px",
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "1px 6px",
                        minWidth: 18,
                        textAlign: "center",
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 12 }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 52, borderRadius: 8 }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                padding: "64px 24px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--color-outline)", opacity: 0.5 }}>
                shelves
              </span>
              <p style={{ fontSize: "var(--text-body-md)", color: "var(--color-secondary)" }}>
                Aucun article trouvé pour les filtres sélectionnés.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-body-sm)" }}>
                <thead>
                  <tr style={{ background: "rgba(245,243,238,0.7)", borderBottom: "1px solid rgba(208,197,175,0.3)" }}>
                    {["Produit", "SKU", "Taille", "Couleur", "Catégorie", "Prix", "Stock", ""].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "14px 20px",
                          textAlign: "left",
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "var(--color-secondary)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((variant) => {
                    const isLow = variant.stock > 0 && variant.stock <= LOW_STOCK_THRESHOLD;
                    const isOut = variant.stock === 0;
                    const isAdjusting = adjustingId === variant.id;

                    return (
                      <tr
                        key={variant.id}
                        style={{
                          borderBottom: "1px solid rgba(208,197,175,0.15)",
                          background: isOut ? "rgba(220,38,38,0.03)" : isLow ? "rgba(245,158,11,0.03)" : "transparent",
                          transition: "background 0.1s",
                        }}
                      >
                        {/* Product name */}
                        <td style={{ padding: "14px 20px", color: "var(--color-on-surface)", fontWeight: 500 }}>
                          {variant.product.name}
                        </td>

                        {/* SKU */}
                        <td style={{ padding: "14px 20px", color: "var(--color-secondary)", fontFamily: "monospace", fontSize: 12 }}>
                          {variant.product.sku}
                        </td>

                        {/* Size */}
                        <td style={{ padding: "14px 20px", color: "var(--color-on-surface)" }}>
                          {variant.size}
                        </td>

                        {/* Color */}
                        <td style={{ padding: "14px 20px", color: "var(--color-on-surface)" }}>
                          {variant.color}
                        </td>

                        {/* Category */}
                        <td style={{ padding: "14px 20px" }}>
                          {variant.product.category ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "2px 10px",
                                borderRadius: "999px",
                                fontSize: 11,
                                fontWeight: 600,
                                background: "rgba(212,175,55,0.1)",
                                color: "var(--color-primary-container)",
                                border: "1px solid rgba(212,175,55,0.2)",
                              }}
                            >
                              {variant.product.category.name}
                            </span>
                          ) : (
                            <span style={{ color: "var(--color-outline)", fontStyle: "italic" }}>—</span>
                          )}
                        </td>

                        {/* Price */}
                        <td style={{ padding: "14px 20px", color: "var(--color-on-surface)", fontVariantNumeric: "tabular-nums" }}>
                          {formatCurrency(variant.product.price)}
                        </td>

                        {/* Stock badge */}
                        <td style={{ padding: "14px 20px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "4px 12px",
                              borderRadius: "999px",
                              fontSize: 12,
                              fontWeight: 700,
                              background: isOut
                                ? "rgba(220,38,38,0.1)"
                                : isLow
                                ? "rgba(245,158,11,0.1)"
                                : "rgba(34,197,94,0.1)",
                              color: isOut ? "#dc2626" : isLow ? "#f59e0b" : "#16a34a",
                              border: `1px solid ${isOut ? "rgba(220,38,38,0.3)" : isLow ? "rgba(245,158,11,0.3)" : "rgba(34,197,94,0.3)"}`,
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {isOut && <span className="material-symbols-outlined" style={{ fontSize: 14 }}>block</span>}
                            {isLow && <span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span>}
                            {variant.stock} unité{variant.stock !== 1 ? "s" : ""}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "14px 20px", textAlign: "right" }}>
                          {isAdjusting ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                              <input
                                type="number"
                                value={adjustValue}
                                onChange={(e) => setAdjustValue(e.target.value)}
                                placeholder="±0"
                                autoFocus
                                style={{
                                  width: 72,
                                  height: 36,
                                  padding: "0 10px",
                                  border: "1px solid rgba(208,197,175,0.5)",
                                  borderRadius: "var(--radius-md)",
                                  background: "var(--color-surface)",
                                  fontSize: "var(--text-body-sm)",
                                  color: "var(--color-on-surface)",
                                  outline: "none",
                                  textAlign: "center",
                                  fontVariantNumeric: "tabular-nums",
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleAdjust(variant.id);
                                  if (e.key === "Escape") { setAdjustingId(null); setAdjustValue(""); }
                                }}
                              />
                              <button
                                onClick={() => handleAdjust(variant.id)}
                                className="btn-primary"
                                style={{ padding: "6px 14px", fontSize: 12, height: 36 }}
                              >
                                OK
                              </button>
                              <button
                                onClick={() => { setAdjustingId(null); setAdjustValue(""); }}
                                style={{
                                  height: 36,
                                  width: 36,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  background: "none",
                                  border: "1px solid rgba(208,197,175,0.3)",
                                  borderRadius: "var(--radius-md)",
                                  cursor: "pointer",
                                  color: "var(--color-secondary)",
                                }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setAdjustingId(variant.id); setAdjustValue(""); }}
                              className="btn-border"
                              style={{ padding: "6px 14px", fontSize: 12 }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>tune</span>
                              Ajuster
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Footer */}
              <div
                style={{
                  padding: "16px 24px",
                  borderTop: "1px solid rgba(208,197,175,0.3)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "rgba(245,243,238,0.3)",
                }}
              >
                <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)" }}>
                  {filtered.length} variante{filtered.length !== 1 ? "s" : ""} affichée{filtered.length !== 1 ? "s" : ""}
                </p>
                <button
                  onClick={fetchInventory}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "var(--color-secondary)",
                    fontSize: "var(--text-body-sm)",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>refresh</span>
                  Actualiser
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
