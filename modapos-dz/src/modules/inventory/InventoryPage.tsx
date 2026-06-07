import { useState, useCallback, useEffect } from "react";
import { TopBar } from "@/components/layout/AppLayout";
import { useIPC } from "@/hooks/useIPC";
import { formatCurrency } from "@/lib/utils";
import { toastSuccess, toastError } from "@/components/ui/toast";
import { Badge } from "@/components/ui/Badge";
import { useTranslation } from "@/hooks/useTranslation";

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
  const { t, isRtl, language } = useTranslation();
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
      toastSuccess(
        t("inventory.toast.success_title"),
        t("inventory.toast.success_desc", { delta: `${delta > 0 ? "+" : ""}${delta}` })
      );
    } catch {
      toastError(t("inventory.toast.error_title"), t("inventory.toast.error_desc"));
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
      <TopBar title={t("common.sidebar.inventory")} description={t("inventory.description")} />

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
              label: t("inventory.kpis.in_stock"),
              value: isLoading ? "—" : totalItems.toLocaleString(language === "ar" ? "ar-DZ" : "fr-DZ"),
              icon: "inventory_2",
              error: false,
            },
            {
              label: t("inventory.kpis.low_stock"),
              value: isLoading ? "—" : lowStockCount.toLocaleString(language === "ar" ? "ar-DZ" : "fr-DZ"),
              icon: "warning",
              error: lowStockCount > 0,
              sub: t("inventory.kpis.low_stock_sub", { threshold: LOW_STOCK_THRESHOLD }),
            },
            {
              label: t("inventory.kpis.out_of_stock"),
              value: isLoading ? "—" : outOfStockCount.toLocaleString(language === "ar" ? "ar-DZ" : "fr-DZ"),
              icon: "remove_shopping_cart",
              error: outOfStockCount > 0,
              sub: t("inventory.kpis.out_of_stock_sub"),
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
                style={{
                  position: "absolute",
                  [isRtl ? "right" : "left"]: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--color-secondary)",
                  fontSize: 22,
                  pointerEvents: "none"
                }}
              >
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("inventory.search_placeholder")}
                style={{
                  width: "100%",
                  height: 48,
                  paddingLeft: isRtl ? 16 : 48,
                  paddingRight: isRtl ? 48 : 16,
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
                { value: "all", label: t("inventory.controls.filter_all"), count: variants.length },
                { value: "low", label: t("inventory.controls.filter_low"), count: lowStockCount },
                { value: "out", label: t("inventory.controls.filter_out"), count: outOfStockCount },
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
                        background: tab.value === "out" && tab.count > 0 ? "var(--color-error)" : tab.value === "low" && tab.count > 0 ? "var(--color-warning)" : "var(--color-outline-variant)",
                        color: tab.count > 0 && tab.value !== "all" ? "white" : "var(--color-secondary)",
                        borderRadius: "999px",
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "1px 6px",
                        [isRtl ? "marginRight" : "marginLeft"]: 6,
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
                {t("inventory.controls.no_articles")}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-body-sm)" }}>
                <thead>
                  <tr style={{ background: "rgba(245,243,238,0.7)", borderBottom: "1px solid rgba(208,197,175,0.3)" }}>
                    {[
                      t("inventory.table.product"),
                      t("inventory.table.sku"),
                      t("inventory.table.size"),
                      t("inventory.table.color"),
                      t("inventory.table.category"),
                      t("inventory.table.price"),
                      t("inventory.table.stock"),
                      "",
                    ].map((h, idx) => (
                      <th
                        key={idx}
                        style={{
                          padding: "14px 20px",
                          textAlign: idx === 7 ? (isRtl ? "left" : "right") : (isRtl ? "right" : "left"),
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
                          background: isOut ? "rgba(186, 26, 26, 0.03)" : isLow ? "rgba(212, 175, 55, 0.03)" : "transparent",
                          transition: "background 0.1s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(212, 175, 55, 0.06)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = isOut ? "rgba(186, 26, 26, 0.03)" : isLow ? "rgba(212, 175, 55, 0.03)" : "transparent")}
                      >
                        {/* Product name */}
                        <td style={{ padding: "14px 20px", color: "var(--color-on-surface)", fontWeight: 500, textAlign: isRtl ? "right" : "left" }}>
                          {variant.product.name}
                        </td>

                        {/* SKU */}
                        <td style={{ padding: "14px 20px", color: "var(--color-secondary)", fontFamily: "monospace", fontSize: 12, textAlign: isRtl ? "right" : "left" }}>
                          {variant.product.sku}
                        </td>

                        {/* Size */}
                        <td style={{ padding: "14px 20px", color: "var(--color-on-surface)", textAlign: isRtl ? "right" : "left" }}>
                          {variant.size}
                        </td>

                        {/* Color */}
                        <td style={{ padding: "14px 20px", color: "var(--color-on-surface)", textAlign: isRtl ? "right" : "left" }}>
                          {variant.color}
                        </td>

                        {/* Category */}
                        <td style={{ padding: "14px 20px", textAlign: isRtl ? "right" : "left" }}>
                          {variant.product.category ? (
                            <Badge variant="accent">
                              {variant.product.category.name}
                            </Badge>
                          ) : (
                            <span style={{ color: "var(--color-outline)", fontStyle: "italic" }}>—</span>
                          )}
                        </td>

                        {/* Price */}
                        <td style={{ padding: "14px 20px", color: "var(--color-on-surface)", fontVariantNumeric: "tabular-nums", textAlign: isRtl ? "right" : "left" }}>
                          {formatCurrency(variant.product.price)}
                        </td>

                        {/* Stock badge */}
                        <td style={{ padding: "14px 20px", textAlign: isRtl ? "right" : "left" }}>
                          <Badge
                            variant={isOut ? "danger" : isLow ? "warning" : "success"}
                            style={{ fontVariantNumeric: "tabular-nums", padding: "4px 12px" }}
                          >
                            {isOut && <span className="material-symbols-outlined" style={{ fontSize: 14 }}>block</span>}
                            {isLow && <span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span>}
                            {t("inventory.table.units", { count: variant.stock })}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "14px 20px", textAlign: isRtl ? "left" : "right" }}>
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
                              {t("inventory.table.adjust_btn")}
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
                  {t("inventory.table.displayed_count", { count: filtered.length })}
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
                  {t("inventory.table.refresh")}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
