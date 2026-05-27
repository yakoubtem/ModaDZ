import { formatCurrency, formatDate } from "@/lib/utils";
import type { RecentSale, LowStockVariant } from "@/types";

interface AlertsPanelProps {
  recentSales?: RecentSale[];
  lowStock?: LowStockVariant[];
  isLoading: boolean;
}

export function AlertsPanel({ recentSales, lowStock, isLoading }: AlertsPanelProps) {
  if (isLoading || !recentSales || !lowStock) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 64, borderRadius: 12 }} />
        ))}
      </div>
    );
  }

  const alertCount = lowStock?.length || 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-headline-md)",
            fontWeight: "var(--fw-headline-md)",
            color: "var(--color-on-surface)",
          }}
        >
          Alertes
        </h3>
        {alertCount > 0 && (
          <span
            style={{
              background: "var(--color-error-container)",
              color: "var(--color-on-error-container)",
              fontSize: "12px",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "999px",
            }}
          >
            {alertCount}
          </span>
        )}
      </div>

      {/* Alerts list */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" }} className="no-scrollbar">
        {/* Low stock alerts */}
        {lowStock.slice(0, 3).map((item) => (
          <div key={item.id} className="alert-card alert-card-gold">
            <span className="material-symbols-outlined" style={{ color: "var(--color-primary-container)", flexShrink: 0 }}>
              inventory
            </span>
            <div>
              <p
                style={{
                  fontSize: "var(--text-label-md)",
                  fontWeight: "var(--fw-label-md)",
                  letterSpacing: "var(--ls-label-md)",
                  color: "var(--color-on-surface)",
                  marginBottom: "4px",
                }}
              >
                Stock faible
              </p>
              <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)" }}>
                {item.product.name} ({item.color}) — Reste {item.stock}
              </p>
            </div>
          </div>
        ))}

        {/* Recent sale alerts if any issues */}
        {recentSales.slice(0, 2).map((sale) => {
          const total = sale.items.reduce((s, i) => s + i.quantity, 0);
          return (
            <div key={sale.id} className="alert-card alert-card-teal">
              <span className="material-symbols-outlined" style={{ color: "var(--color-tertiary)", flexShrink: 0 }}>
                mark_email_unread
              </span>
              <div>
                <p
                  style={{
                    fontSize: "var(--text-label-md)",
                    fontWeight: "var(--fw-label-md)",
                    letterSpacing: "var(--ls-label-md)",
                    color: "var(--color-on-surface)",
                    marginBottom: "4px",
                  }}
                >
                  Nouvelle vente
                </p>
                <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)" }}>
                  {sale.customer?.name || "Client passager"} — {formatCurrency(sale.total)} · {total} art.
                </p>
              </div>
            </div>
          );
        })}

        {alertCount === 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "16px",
              borderRadius: "12px",
              background: "rgba(39,104,104,0.08)",
            }}
          >
            <span className="material-symbols-outlined" style={{ color: "var(--color-tertiary)" }}>check_circle</span>
            <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-tertiary)" }}>
              Tout est en ordre.
            </p>
          </div>
        )}
      </div>

      {/* Footer button */}
      <button
        style={{
          marginTop: "24px",
          width: "100%",
          padding: "8px",
          border: "1px solid var(--color-outline-variant)",
          borderRadius: "var(--radius-lg)",
          background: "transparent",
          color: "var(--color-secondary)",
          fontSize: "var(--text-label-md)",
          fontWeight: "var(--fw-label-md)",
          letterSpacing: "var(--ls-label-md)",
          fontFamily: "var(--font-body)",
          cursor: "pointer",
        }}
      >
        Voir toutes les alertes
      </button>
    </div>
  );
}