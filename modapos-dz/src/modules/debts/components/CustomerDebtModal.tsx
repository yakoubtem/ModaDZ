import { useState } from "react";
import { createPortal } from "react-dom";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { PaymentFormModal } from "./PaymentFormModal";
import type { DebtCustomerDetail } from "@/types";

// ─── Method label helper ──────────────────────────────────

function methodLabel(method: string): string {
  switch (method) {
    case "cash":     return "Espèces";
    case "card":     return "Carte";
    case "transfer": return "Virement";
    default:         return method;
  }
}

function methodIcon(method: string): string {
  switch (method) {
    case "cash":     return "payments";
    case "card":     return "credit_card";
    case "transfer": return "account_balance";
    default:         return "help";
  }
}

// ─── Tab type ────────────────────────────────────────────

type Tab = "sales" | "payments";

// ─── Props ───────────────────────────────────────────────

interface CustomerDebtModalProps {
  isOpen: boolean;
  detail: DebtCustomerDetail | null;
  isLoading: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export function CustomerDebtModal({
  isOpen,
  detail,
  isLoading,
  onClose,
  onPaymentSuccess,
}: CustomerDebtModalProps) {
  const [tab, setTab] = useState<Tab>("sales");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setTab("sales");
    onClose();
  };

  const handlePaymentSuccess = () => {
    onPaymentSuccess();
  };

  const tabStyle = (active: boolean) => ({
    padding: "10px 20px",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontFamily: "var(--font-body)",
    fontSize: "var(--text-label-md)",
    fontWeight: active ? 700 : 400,
    color: active ? "var(--color-primary)" : "var(--color-secondary)",
    borderBottom: active ? "2px solid var(--color-primary-container)" : "2px solid transparent",
    transition: "all 0.15s ease",
  });

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 900,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(79,70,53,0.3)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
        onClick={handleClose}
      />

      {/* Modal Panel */}
      <div
        className="animate-scale-in"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 860,
          maxHeight: "calc(100dvh - 2rem)",
          background: "var(--color-surface-container-lowest)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid rgba(208,197,175,0.3)",
          boxShadow: "var(--shadow-elevated)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ── HEADER ── */}
        <div
          style={{
            padding: "24px 28px 0",
            borderBottom: "1px solid rgba(208,197,175,0.2)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 20,
            }}
          >
            <div>
              {isLoading ? (
                <>
                  <div className="skeleton" style={{ height: 28, width: 200, marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 16, width: 140 }} />
                </>
              ) : detail ? (
                <>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--text-headline-md)",
                      fontWeight: "var(--fw-headline-lg)",
                      color: "var(--color-on-surface)",
                      marginBottom: 4,
                    }}
                  >
                    {detail.name}
                  </h2>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {detail.phone && (
                      <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>phone</span>
                        {detail.phone}
                      </span>
                    )}
                    {detail.email && (
                      <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>mail</span>
                        {detail.email}
                      </span>
                    )}
                    {detail.notes && (
                      <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>sticky_note_2</span>
                        {detail.notes}
                      </span>
                    )}
                  </div>
                </>
              ) : null}
            </div>
            <button
              onClick={handleClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-secondary)",
                display: "flex",
                padding: 4,
                flexShrink: 0,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
            </button>
          </div>

          {/* ── Debt Summary Cards ── */}
          {!isLoading && detail && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
                marginBottom: 20,
              }}
            >
              {[
                {
                  label: "Total achats",
                  value: formatCurrency(detail.summary.totalPurchases),
                  icon: "shopping_bag",
                  color: "var(--color-primary)",
                  bg: "rgba(212,175,55,0.1)",
                },
                {
                  label: "Total payé",
                  value: formatCurrency(detail.summary.totalPaid),
                  icon: "check_circle",
                  color: "var(--color-tertiary)",
                  bg: "rgba(39,104,104,0.1)",
                },
                {
                  label: "Dette restante",
                  value: formatCurrency(detail.summary.currentDebt),
                  icon: "account_balance_wallet",
                  color: detail.summary.currentDebt > 0 ? "var(--color-error)" : "var(--color-tertiary)",
                  bg: detail.summary.currentDebt > 0 ? "rgba(186,26,26,0.08)" : "rgba(39,104,104,0.1)",
                },
              ].map((card) => (
                <div
                  key={card.label}
                  style={{
                    background: card.bg,
                    borderRadius: "var(--radius-lg)",
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span className="material-symbols-outlined filled" style={{ fontSize: 22, color: card.color }}>
                    {card.icon}
                  </span>
                  <div>
                    <p style={{ fontSize: 11, color: "var(--color-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>
                      {card.label}
                    </p>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: card.color }}>
                      {card.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Tabs + Pay Button ── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 0 }}>
              <button style={tabStyle(tab === "sales")} onClick={() => setTab("sales")}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: "middle", marginRight: 6 }}>
                  receipt_long
                </span>
                Historique des ventes ({detail?.sales.length ?? 0})
              </button>
              <button style={tabStyle(tab === "payments")} onClick={() => setTab("payments")}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: "middle", marginRight: 6 }}>
                  payments
                </span>
                Historique des paiements ({detail?.payments.length ?? 0})
              </button>
            </div>

            {detail && detail.summary.currentDebt > 0 && (
              <button
                className="btn-primary"
                onClick={() => setIsPaymentOpen(true)}
                style={{ marginBottom: 0, display: "flex", alignItems: "center", gap: 6, padding: "8px 18px" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_circle</span>
                Enregistrer un paiement
              </button>
            )}
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0" }}>
          {isLoading ? (
            <div style={{ padding: 28 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ display: "flex", gap: 16, marginBottom: 16, alignItems: "center" }}>
                  <div className="skeleton" style={{ height: 16, flex: 1 }} />
                  <div className="skeleton" style={{ height: 16, width: 100 }} />
                  <div className="skeleton" style={{ height: 16, width: 100 }} />
                </div>
              ))}
            </div>
          ) : tab === "sales" ? (
            /* ── Sales Table ── */
            detail && detail.sales.length > 0 ? (
              <table className="table-base" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    {["N° Facture", "Date", "Total", "Payé", "Restant", "Méthode", "Statut"].map(
                      (col) => <th key={col}>{col}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {detail.sales.map((sale) => (
                    <tr key={sale.id} style={{ cursor: "default" }}>
                      <td>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13 }}>
                          {sale.receiptNumber ?? `#${sale.id}`}
                        </span>
                      </td>
                      <td style={{ color: "var(--color-secondary)", fontSize: 13 }}>
                        {formatDate(sale.createdAt)}
                      </td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(sale.total)}</td>
                      <td style={{ color: "var(--color-tertiary)", fontWeight: 600 }}>
                        {formatCurrency(sale.amountPaid)}
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            color: sale.remaining > 0 ? "var(--color-error)" : "var(--color-tertiary)",
                          }}
                        >
                          {formatCurrency(sale.remaining)}
                        </span>
                      </td>
                      <td style={{ color: "var(--color-secondary)", fontSize: 13 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                            {methodIcon(sale.paymentMethod)}
                          </span>
                          {methodLabel(sale.paymentMethod)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            sale.status === "completed"
                              ? "chip chip-success"
                              : sale.status === "refunded"
                              ? "chip chip-error"
                              : "chip chip-default"
                          }
                          style={{ fontSize: 11 }}
                        >
                          {sale.status === "completed"
                            ? "Complétée"
                            : sale.status === "refunded"
                            ? "Remboursée"
                            : "En attente"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: "48px 28px", textAlign: "center", color: "var(--color-secondary)" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 40, display: "block", marginBottom: 8, opacity: 0.4 }}>
                  receipt_long
                </span>
                Aucune vente trouvée
              </div>
            )
          ) : (
            /* ── Payment History ── */
            detail && detail.payments.length > 0 ? (
              <table className="table-base" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    {["Date", "Montant", "Méthode", "Note"].map(
                      (col) => <th key={col}>{col}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {detail.payments.map((p) => (
                    <tr key={p.id} style={{ cursor: "default" }}>
                      <td style={{ color: "var(--color-secondary)", fontSize: 13 }}>
                        {formatDateTime(p.createdAt)}
                      </td>
                      <td>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--color-tertiary)" }}>
                          +{formatCurrency(p.amount)}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--color-secondary)", fontSize: 13 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                            {methodIcon(p.method)}
                          </span>
                          {methodLabel(p.method)}
                        </span>
                      </td>
                      <td style={{ color: "var(--color-secondary)", fontSize: 13 }}>
                        {p.note ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: "48px 28px", textAlign: "center", color: "var(--color-secondary)" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 40, display: "block", marginBottom: 8, opacity: 0.4 }}>
                  payments
                </span>
                Aucun paiement enregistré
              </div>
            )
          )}
        </div>
      </div>

      {/* ── Payment Sub-Modal ── */}
      {detail && (
        <PaymentFormModal
          isOpen={isPaymentOpen}
          customerId={detail.id}
          customerName={detail.name}
          currentDebt={detail.summary.currentDebt}
          onClose={() => setIsPaymentOpen(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>,
    document.body
  );
}
