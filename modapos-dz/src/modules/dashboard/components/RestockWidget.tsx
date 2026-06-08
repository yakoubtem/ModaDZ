import type { LowStockVariant } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

interface RestockWidgetProps {
  lowStock?: LowStockVariant[];
  isLoading: boolean;
}

export function RestockWidget({ lowStock, isLoading }: RestockWidgetProps) {
  const { t, isRtl } = useTranslation();

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "24px" }}>
        <div className="skeleton" style={{ height: 24, width: "50%", marginBottom: 12 }} />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 40, borderRadius: 8 }} />
        ))}
      </div>
    );
  }

  const items = lowStock || [];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        textAlign: isRtl ? "right" : "left",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
          flexDirection: isRtl ? "row-reverse" : "row",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="material-symbols-outlined" style={{ color: "var(--color-error)" }}>
            warning
          </span>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "16px",
              fontWeight: 700,
              color: "var(--color-on-surface)",
            }}
          >
            {t("dashboard.restock_widget.title") || "Produits à réapprovisionner"}
          </h3>
        </div>
        {items.length > 0 && (
          <span
            style={{
              background: "rgba(186, 26, 26, 0.1)",
              color: "var(--color-error)",
              fontSize: "12px",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "999px",
              border: "1px solid rgba(186, 26, 26, 0.2)",
            }}
          >
            {items.length}
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", maxHeight: "260px" }} className="no-scrollbar">
        {items.length === 0 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "16px",
              borderRadius: "12px",
              background: "rgba(39,104,104,0.08)",
              flexDirection: isRtl ? "row-reverse" : "row",
            }}
          >
            <span className="material-symbols-outlined" style={{ color: "var(--color-tertiary)" }}>
              check_circle
            </span>
            <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-tertiary)", fontWeight: 500 }}>
              {t("dashboard.restock_widget.all_clear") || "Tous les stocks sont suffisants."}
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(208, 197, 175, 0.25)", color: "var(--color-outline)" }}>
                <th style={{ padding: "8px 4px", textAlign: isRtl ? "right" : "left", fontWeight: 600 }}>
                  {t("dashboard.restock_widget.product") || "Produit"}
                </th>
                <th style={{ padding: "8px 4px", textAlign: "right", fontWeight: 600, width: "90px" }}>
                  {t("dashboard.restock_widget.stock") || "Stock"}
                </th>
                <th style={{ padding: "8px 4px", textAlign: "right", fontWeight: 600, width: "60px" }}>
                  {t("dashboard.restock_widget.min_stock") || "Seuil"}
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid rgba(208, 197, 175, 0.15)" }}>
                  <td style={{ padding: "8px 4px", color: "var(--color-on-surface)" }}>
                    <div style={{ fontWeight: 600 }}>{item.product.name}</div>
                    <div style={{ fontSize: "10px", color: "var(--color-secondary)", marginTop: "2px" }}>
                      Taille: {item.size} | Couleur: {item.color}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "8px 4px",
                      textAlign: "right",
                      fontWeight: 700,
                      color: item.stock <= 0 ? "var(--color-error)" : "#b39126",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {item.stock}
                  </td>
                  <td style={{ padding: "8px 4px", textAlign: "right", color: "var(--color-secondary)", fontVariantNumeric: "tabular-nums" }}>
                    5
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
