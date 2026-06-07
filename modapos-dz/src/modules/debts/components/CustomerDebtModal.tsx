import { useState } from "react";
import { createPortal } from "react-dom";
import { formatCurrency, formatDate, formatDateTime, initials } from "@/lib/utils";
import { PaymentFormModal } from "./PaymentFormModal";
import type { DebtCustomerDetail } from "@/types";
import { PaymentStatusBadge } from "@/components/ui/PaymentStatusBadge";
import { useTranslation } from "@/hooks/useTranslation";

// ─── Helpers ─────────────────────────────────────────────

function methodIcon(method: string): string {
  switch (method) {
    case "cash":     return "payments";
    case "card":     return "credit_card";
    case "transfer": return "account_balance";
    default:         return "help";
  }
}

// ─── Inner table empty state ──────────────────────────────

function TabEmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 32px", gap: 14 }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "var(--radius-xl)",
          background: "rgba(208,197,175,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--color-outline)", opacity: 0.7 }}>{icon}</span>
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontWeight: 600, fontSize: "var(--text-body-sm)", color: "var(--color-on-surface)", marginBottom: 5 }}>{title}</p>
        <p style={{ fontSize: 12, color: "var(--color-secondary)", lineHeight: 1.6 }}>{description}</p>
      </div>
    </div>
  );
}

// ─── Table header / cell helpers ─────────────────────────

function TH({ children }: { children: React.ReactNode }) {
  const { isRtl } = useTranslation();
  return (
    <th
      style={{
        padding: "11px 20px",
        textAlign: isRtl ? "right" : "left",
        fontSize: "var(--text-label-sm)",
        fontWeight: 700,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        color: "var(--color-secondary)",
        borderBottom: "1px solid rgba(208,197,175,0.18)",
        background: "rgba(248,246,240,0.6)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function TD({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const { isRtl } = useTranslation();
  return (
    <td
      style={{
        padding: "16px 20px",
        borderBottom: "1px solid rgba(208,197,175,0.1)",
        fontSize: "var(--text-body-sm)",
        verticalAlign: "middle",
        textAlign: isRtl ? "right" : "left",
        ...style,
      }}
    >
      {children}
    </td>
  );
}

// ─── Types ────────────────────────────────────────────────

type Tab = "sales" | "payments";

interface CustomerDebtModalProps {
  isOpen: boolean;
  detail: DebtCustomerDetail | null;
  isLoading: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

// ─── Component ───────────────────────────────────────────

export function CustomerDebtModal({
  isOpen,
  detail,
  isLoading,
  onClose,
  onPaymentSuccess,
}: CustomerDebtModalProps) {
  const { t, isRtl } = useTranslation();
  const [tab, setTab] = useState<Tab>("sales");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => { setTab("sales"); onClose(); };
  const handlePaymentSuccess = () => { onPaymentSuccess(); };

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 900,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 16px",
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(30,24,16,0.38)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        onClick={handleClose}
      />

      {/* Modal Panel */}
      <div
        className="animate-scale-in"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 920,
          maxHeight: "calc(100dvh - 2.5rem)",
          background: "var(--color-surface-container-lowest)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid rgba(208,197,175,0.25)",
          boxShadow: "0 32px 80px rgba(30,24,16,0.22), 0 0 0 1px rgba(255,255,255,0.55) inset",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ── HEADER ── */}
        <div
          style={{
            padding: "28px 32px 0",
            borderBottom: "1px solid rgba(208,197,175,0.15)",
            flexShrink: 0,
          }}
        >
          {/* Title row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* Avatar */}
              {!isLoading && detail && (
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "var(--radius-full)",
                    background:
                      detail.summary.currentDebt > 50000
                        ? "rgba(186,26,26,0.1)"
                        : detail.summary.currentDebt > 0
                        ? "rgba(180,83,9,0.08)"
                        : "rgba(39,104,104,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    color:
                      detail.summary.currentDebt > 50000
                        ? "var(--color-error)"
                        : detail.summary.currentDebt > 0
                        ? "var(--color-warning)"
                        : "var(--color-tertiary)",
                    flexShrink: 0,
                  }}
                >
                  {initials(detail.name)}
                </div>
              )}

              <div>
                {isLoading ? (
                  <>
                    <div className="skeleton" style={{ height: 26, width: 200, marginBottom: 10 }} />
                    <div className="skeleton" style={{ height: 14, width: 150 }} />
                  </>
                ) : detail ? (
                  <>
                    <h2
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 22,
                        fontWeight: 700,
                        color: "var(--color-on-surface)",
                        marginBottom: 5,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {detail.name}
                    </h2>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      {detail.phone && (
                        <span style={{ fontSize: 13, color: "var(--color-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>phone</span>
                          {detail.phone}
                        </span>
                      )}
                      {detail.email && (
                        <span style={{ fontSize: 13, color: "var(--color-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>mail</span>
                          {detail.email}
                        </span>
                      )}
                      {detail.notes && (
                        <span style={{ fontSize: 13, color: "var(--color-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>sticky_note_2</span>
                          {detail.notes}
                        </span>
                      )}
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            <button
              onClick={handleClose}
              style={{
                background: "var(--color-surface-container-high)",
                border: "none",
                cursor: "pointer",
                color: "var(--color-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 8,
                borderRadius: "var(--radius-full)",
                flexShrink: 0,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
            </button>
          </div>

          {/* ── Summary Cards ── */}
          {!isLoading && detail && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 24 }}>
              {[
                {
                  label: t("debts.customer_debts.total_purchases"),
                  value: formatCurrency(detail.summary.totalPurchases),
                  icon: "shopping_bag",
                  color: "var(--color-primary)",
                  bg: "rgba(212,175,55,0.08)",
                  border: "rgba(212,175,55,0.2)",
                },
                {
                  label: t("debts.customer_debts.total_paid"),
                  value: formatCurrency(detail.summary.totalPaid),
                  icon: "check_circle",
                  color: "var(--color-tertiary)",
                  bg: "rgba(39,104,104,0.08)",
                  border: "rgba(39,104,104,0.2)",
                },
                {
                  label: t("debts.customer_debts.remaining"),
                  value: formatCurrency(detail.summary.currentDebt),
                  icon: "account_balance_wallet",
                  color: detail.summary.currentDebt > 0 ? "var(--color-error)" : "var(--color-tertiary)",
                  bg: detail.summary.currentDebt > 0 ? "rgba(186,26,26,0.06)" : "rgba(39,104,104,0.08)",
                  border: detail.summary.currentDebt > 0 ? "rgba(186,26,26,0.2)" : "rgba(39,104,104,0.2)",
                },
              ].map((card) => (
                <div
                  key={card.label}
                  style={{
                    background: card.bg,
                    border: `1px solid ${card.border}`,
                    borderRadius: "var(--radius-lg)",
                    padding: "16px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="material-symbols-outlined filled" style={{ fontSize: 18, color: card.color }}>{card.icon}</span>
                    <p style={{ fontSize: 11, color: "var(--color-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700 }}>
                      {card.label}
                    </p>
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: 18,
                      color: card.color,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {card.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* ── Tabs + Action ── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex" }}>
              <button
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "14px 22px", border: "none", background: "none", cursor: "pointer",
                  fontFamily: "var(--font-body)", fontSize: "var(--text-label-md)",
                  fontWeight: tab === "sales" ? 700 : 500,
                  color: tab === "sales" ? "var(--color-on-surface)" : "var(--color-secondary)",
                  borderBottom: tab === "sales" ? "2px solid var(--color-primary-container)" : "2px solid transparent",
                  transition: "all 0.15s ease", whiteSpace: "nowrap",
                }}
                onClick={() => setTab("sales")}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>receipt_long</span>
                {t("common.sidebar.sales")}
                <span style={{ padding: "1px 7px", borderRadius: "var(--radius-full)", background: tab === "sales" ? "rgba(212,175,55,0.15)" : "rgba(208,197,175,0.2)", color: tab === "sales" ? "var(--color-primary)" : "var(--color-secondary)", fontSize: 11, fontWeight: 700, [isRtl ? "marginRight" : "marginLeft"]: 5 }}>
                  {detail?.sales.length ?? 0}
                </span>
              </button>
              <button
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "14px 22px", border: "none", background: "none", cursor: "pointer",
                  fontFamily: "var(--font-body)", fontSize: "var(--text-label-md)",
                  fontWeight: tab === "payments" ? 700 : 500,
                  color: tab === "payments" ? "var(--color-on-surface)" : "var(--color-secondary)",
                  borderBottom: tab === "payments" ? "2px solid var(--color-primary-container)" : "2px solid transparent",
                  transition: "all 0.15s ease", whiteSpace: "nowrap",
                }}
                onClick={() => setTab("payments")}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>payments</span>
                {t("debts.customer_debts.payments_tab")}
                <span style={{ padding: "1px 7px", borderRadius: "var(--radius-full)", background: tab === "payments" ? "rgba(212,175,55,0.15)" : "rgba(208,197,175,0.2)", color: tab === "payments" ? "var(--color-primary)" : "var(--color-secondary)", fontSize: 11, fontWeight: 700, [isRtl ? "marginRight" : "marginLeft"]: 5 }}>
                  {detail?.payments.length ?? 0}
                </span>
              </button>
            </div>

            {detail && detail.summary.currentDebt > 0 && (
              <button
                className="btn-primary"
                onClick={() => setIsPaymentOpen(true)}
                style={{ marginBottom: 0, gap: 7, padding: "9px 20px" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 17 }}>add_circle</span>
                {t("debts.payment_modal.title")}
              </button>
            )}
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {isLoading ? (
            <div style={{ padding: "28px 32px" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ display: "flex", gap: 16, marginBottom: 18, alignItems: "center" }}>
                  <div className="skeleton" style={{ height: 14, flex: 2 }} />
                  <div className="skeleton" style={{ height: 14, width: 110 }} />
                  <div className="skeleton" style={{ height: 14, width: 110 }} />
                  <div className="skeleton" style={{ height: 14, width: 80 }} />
                </div>
              ))}
            </div>
          ) : tab === "sales" ? (
            detail && detail.sales.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <TH>{t("sales.table.receipt")}</TH>
                    <TH>{t("sales.table.date")}</TH>
                    <TH>{t("sales.table.total")}</TH>
                    <TH>{t("sales.table.paid")}</TH>
                    <TH>{t("debts.customer_debts.remaining")}</TH>
                    <TH>{t("sales.table.payment_method")}</TH>
                    <TH>{t("sales.table.status")}</TH>
                    <TH>{t("sales.filters.payment_method")}</TH>
                  </tr>
                </thead>
                <tbody>
                  {detail.sales.map((sale) => (
                    <tr key={sale.id}>
                      <TD>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, letterSpacing: "-0.01em" }}>
                          {sale.receiptNumber ?? `#${sale.id}`}
                        </span>
                      </TD>
                      <TD style={{ color: "var(--color-secondary)" }}>{formatDate(sale.createdAt)}</TD>
                      <TD style={{ fontWeight: 600 }}>{formatCurrency(sale.total)}</TD>
                      <TD style={{ color: "var(--color-tertiary)", fontWeight: 600 }}>{formatCurrency(sale.amountPaid)}</TD>
                      <TD>
                        <span style={{ fontWeight: 700, color: sale.remaining > 0 ? "var(--color-error)" : "var(--color-tertiary)", fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}>
                          {formatCurrency(sale.remaining)}
                        </span>
                      </TD>
                      <TD style={{ color: "var(--color-secondary)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{methodIcon(sale.paymentMethod)}</span>
                          {t("common.payment_methods." + sale.paymentMethod)}
                        </span>
                      </TD>
                      <TD>
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
                          {sale.status === "completed" ? t("common.status.completed") : sale.status === "refunded" ? t("common.status.refunded") : t("common.status.pending")}
                        </span>
                      </TD>
                      <TD>
                        <PaymentStatusBadge
                          amountPaid={sale.amountPaid}
                          total={sale.total}
                          compact
                        />
                      </TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <TabEmptyState
                icon="receipt_long"
                title={t("sales.table.no_sales_found")}
                description={t("debts.customer_debts.no_sales_desc")}
              />
            )
          ) : (
            detail && detail.payments.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <TH>{t("sales.table.date")}</TH>
                    <TH>{t("debts.customer_debts.total_paid")}</TH>
                    <TH>{t("sales.table.payment_method")}</TH>
                    <TH>{t("debts.payment_modal.note")}</TH>
                  </tr>
                </thead>
                <tbody>
                  {detail.payments.map((p) => (
                    <tr key={p.id}>
                      <TD style={{ color: "var(--color-secondary)" }}>{formatDateTime(p.createdAt)}</TD>
                      <TD>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--color-tertiary)", letterSpacing: "-0.01em", fontSize: 15 }}>
                          +{formatCurrency(p.amount)}
                        </span>
                      </TD>
                      <TD style={{ color: "var(--color-secondary)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{methodIcon(p.method)}</span>
                          {t("common.payment_methods." + p.method)}
                        </span>
                      </TD>
                      <TD style={{ color: "var(--color-secondary)" }}>
                        {p.note ?? <span style={{ opacity: 0.4 }}>—</span>}
                      </TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <TabEmptyState
                icon="payments"
                title={t("debts.customer_debts.no_payments")}
                description={t("debts.customer_debts.no_payments_desc")}
              />
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
