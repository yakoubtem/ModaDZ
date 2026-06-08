import { formatCurrency } from "@/lib/utils";
import type { RecentSale, LowStockVariant, ExpenseAlert } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

interface AlertsPanelProps {
  recentSales?: RecentSale[];
  lowStock?: LowStockVariant[];
  expenseAlerts?: ExpenseAlert[];
  isLoading: boolean;
}

export function AlertsPanel({ recentSales, lowStock, expenseAlerts, isLoading }: AlertsPanelProps) {
  const { t, isRtl } = useTranslation();

  if (isLoading || !recentSales || !lowStock || !expenseAlerts) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 64, borderRadius: 12 }} />
        ))}
      </div>
    );
  }

  const alertCount = (lowStock?.length || 0) + (expenseAlerts?.length || 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", textAlign: isRtl ? "right" : "left" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          flexDirection: isRtl ? "row-reverse" : "row",
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
          {t("dashboard.alerts_panel.title")}
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
        {/* Expense alerts */}
        {expenseAlerts.slice(0, 3).map((alert, index) => (
          <div
            key={`${alert.type}-${index}`}
            className={alert.severity === "danger" ? "alert-card alert-card-error" : "alert-card alert-card-gold"}
            style={{ flexDirection: isRtl ? "row-reverse" : "row", textAlign: isRtl ? "right" : "left" }}
          >
            <span className="material-symbols-outlined" style={{ color: "var(--color-primary)", flexShrink: 0 }}>
              warning
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
                {alert.title}
              </p>
              <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)" }}>
                {alert.message}
              </p>
            </div>
          </div>
        ))}

        {/* Low stock alerts */}
        {lowStock.slice(0, 3).map((item) => (
          <div
            key={item.id}
            className="alert-card alert-card-gold"
            style={{ flexDirection: isRtl ? "row-reverse" : "row", textAlign: isRtl ? "right" : "left" }}
          >
            <span className="material-symbols-outlined" style={{ color: "var(--color-primary)", flexShrink: 0 }}>
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
                {t("dashboard.alerts_panel.low_stock")}
              </p>
              <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)" }}>
                {item.product.name} ({item.color}) — {t("dashboard.alerts_panel.remaining_stock", { count: item.stock })}
              </p>
            </div>
          </div>
        ))}

        {/* Recent sale alerts if any issues */}
        {recentSales.slice(0, 2).map((sale) => {
          const total = sale.items.reduce((s, i) => s + i.quantity, 0);
          return (
            <div
              key={sale.id}
              className="alert-card alert-card-teal"
              style={{ flexDirection: isRtl ? "row-reverse" : "row", textAlign: isRtl ? "right" : "left" }}
            >
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
                  {t("dashboard.alerts_panel.new_sale")}
                </p>
                <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)" }}>
                  {sale.customer?.name || t("pos.cart.customer_none")} — {formatCurrency(sale.total)} · {t("pos.cart.items_count", { count: total })}
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
              flexDirection: isRtl ? "row-reverse" : "row",
            }}
          >
            <span className="material-symbols-outlined" style={{ color: "var(--color-tertiary)" }}>check_circle</span>
            <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-tertiary)" }}>
              {t("dashboard.alerts_panel.all_clear")}
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
        {t("dashboard.alerts_panel.view_all")}
      </button>
    </div>
  );
}