import { useState } from "react";
import { createPortal } from "react-dom";
import { formatCurrency, formatDate, formatDateTime, initials } from "@/lib/utils";
import { SupplierPaymentFormModal } from "./SupplierPaymentFormModal";
import type { DebtSupplierDetail } from "@/types";
import { PaymentStatusBadge } from "@/components/ui/PaymentStatusBadge";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/modules/auth/AuthContext";
import { useSupplierDebtPayments } from "../hooks/useSupplierDebtPayments";

function methodIcon(method: string): string {
  switch (method) {
    case "cash": return "payments";
    case "card": return "credit_card";
    case "transfer": return "account_balance";
    default: return "help";
  }
}

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

function TH({ children }: { children?: React.ReactNode }) {
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

type Tab = "purchases" | "payments" | "statement";

interface SupplierDebtModalProps {
  isOpen: boolean;
  detail: DebtSupplierDetail | null;
  isLoading: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  onPrintStatement: (supplierId: number) => void;
}

export function SupplierDebtModal({
  isOpen,
  detail,
  isLoading,
  onClose,
  onPaymentSuccess,
  onPrintStatement,
}: SupplierDebtModalProps) {
  const { t, isRtl } = useTranslation();
  const { can, user } = useAuth();
  const { deletePayment } = useSupplierDebtPayments();
  const [tab, setTab] = useState<Tab>("purchases");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setTab("purchases");
    onClose();
  };

  const handleDeletePayment = async (paymentId: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce règlement ? Cette action rétablira la dette des achats correspondants.")) return;
    const ok = await deletePayment(paymentId, user?.id || 1);
    if (ok) {
      onPaymentSuccess();
    }
  };

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
          boxShadow: "0 32px 80px rgba(30,24,16,0.2), 0 0 0 1px rgba(255,255,255,0.55) inset",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          textAlign: isRtl ? "right" : "left",
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexDirection: isRtl ? "row-reverse" : "row" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexDirection: isRtl ? "row-reverse" : "row" }}>
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
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
              {[
                {
                  label: t("supplierDebts.supplier_debts.total_purchases"),
                  value: formatCurrency(detail.summary.totalPurchases),
                  icon: "shopping_bag",
                  color: "var(--color-primary)",
                  bg: "rgba(212,175,55,0.08)",
                  border: "rgba(212,175,55,0.2)",
                },
                {
                  label: t("supplierDebts.supplier_debts.total_paid"),
                  value: formatCurrency(detail.summary.totalPaid),
                  icon: "check_circle",
                  color: "var(--color-tertiary)",
                  bg: "rgba(39,104,104,0.08)",
                  border: "rgba(39,104,104,0.2)",
                },
                {
                  label: t("supplierDebts.supplier_debts.remaining"),
                  value: formatCurrency(detail.summary.currentDebt),
                  icon: "account_balance_wallet",
                  color: detail.summary.currentDebt > 0 ? "var(--color-error)" : "var(--color-tertiary)",
                  bg: detail.summary.currentDebt > 0 ? "rgba(186,26,26,0.06)" : "rgba(39,104,104,0.08)",
                  border: detail.summary.currentDebt > 0 ? "rgba(186,26,26,0.2)" : "rgba(39,104,104,0.2)",
                },
                {
                  label: t("supplierDebts.supplier_debts.last_payment_date"),
                  value: detail.summary.lastPaymentDate ? formatDate(detail.summary.lastPaymentDate) : "—",
                  icon: "calendar_today",
                  color: "var(--color-info)",
                  bg: "rgba(2,132,199,0.06)",
                  border: "rgba(2,132,199,0.18)",
                }
              ].map((card) => (
                <div
                  key={card.label}
                  style={{
                    background: card.bg,
                    border: `1px solid ${card.border}`,
                    borderRadius: "var(--radius-lg)",
                    padding: "14px 18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
                    <span className="material-symbols-outlined filled" style={{ fontSize: 18, color: card.color }}>{card.icon}</span>
                    <p style={{ fontSize: 11, color: "var(--color-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700 }}>
                      {card.label}
                    </p>
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: 16,
                      color: card.color,
                      letterSpacing: "-0.02em",
                      direction: "ltr",
                      textAlign: isRtl ? "right" : "left",
                    }}
                  >
                    {card.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* ── Tabs + Action ── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
            <div style={{ display: "flex", flexDirection: isRtl ? "row-reverse" : "row" }}>
              <button
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "14px 18px", border: "none", background: "none", cursor: "pointer",
                  fontFamily: "var(--font-body)", fontSize: "var(--text-label-md)",
                  fontWeight: tab === "purchases" ? 700 : 500,
                  color: tab === "purchases" ? "var(--color-on-surface)" : "var(--color-secondary)",
                  borderBottom: tab === "purchases" ? "2px solid var(--color-primary)" : "2px solid transparent",
                  transition: "all 0.15s ease", whiteSpace: "nowrap",
                  flexDirection: isRtl ? "row-reverse" : "row",
                }}
                onClick={() => setTab("purchases")}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>shopping_cart</span>
                {t("common.sidebar.purchases")}
                <span style={{ padding: "1px 7px", borderRadius: "var(--radius-full)", background: tab === "purchases" ? "rgba(212,175,55,0.15)" : "rgba(208,197,175,0.2)", color: tab === "purchases" ? "var(--color-primary)" : "var(--color-secondary)", fontSize: 10, fontWeight: 700, [isRtl ? "marginRight" : "marginLeft"]: 5 }}>
                  {detail?.purchases.length ?? 0}
                </span>
              </button>
              <button
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "14px 18px", border: "none", background: "none", cursor: "pointer",
                  fontFamily: "var(--font-body)", fontSize: "var(--text-label-md)",
                  fontWeight: tab === "payments" ? 700 : 500,
                  color: tab === "payments" ? "var(--color-on-surface)" : "var(--color-secondary)",
                  borderBottom: tab === "payments" ? "2px solid var(--color-primary)" : "2px solid transparent",
                  transition: "all 0.15s ease", whiteSpace: "nowrap",
                  flexDirection: isRtl ? "row-reverse" : "row",
                }}
                onClick={() => setTab("payments")}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>payments</span>
                {t("supplierDebts.supplier_debts.payments_tab")}
                <span style={{ padding: "1px 7px", borderRadius: "var(--radius-full)", background: tab === "payments" ? "rgba(212,175,55,0.15)" : "rgba(208,197,175,0.2)", color: tab === "payments" ? "var(--color-primary)" : "var(--color-secondary)", fontSize: 10, fontWeight: 700, [isRtl ? "marginRight" : "marginLeft"]: 5 }}>
                  {detail?.payments.length ?? 0}
                </span>
              </button>
              <button
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "14px 18px", border: "none", background: "none", cursor: "pointer",
                  fontFamily: "var(--font-body)", fontSize: "var(--text-label-md)",
                  fontWeight: tab === "statement" ? 700 : 500,
                  color: tab === "statement" ? "var(--color-on-surface)" : "var(--color-secondary)",
                  borderBottom: tab === "statement" ? "2px solid var(--color-primary)" : "2px solid transparent",
                  transition: "all 0.15s ease", whiteSpace: "nowrap",
                  flexDirection: isRtl ? "row-reverse" : "row",
                }}
                onClick={() => setTab("statement")}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>list_alt</span>
                {t("supplierDebts.supplier_debts.statement_tab")}
              </button>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {detail && (
                <button
                  className="btn-border"
                  onClick={() => onPrintStatement(detail.id)}
                  style={{ gap: 6, padding: "8px 14px" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>print</span>
                  {t("statement.title")}
                </button>
              )}
              {detail && detail.summary.currentDebt > 0 && can("supplierPayments.create") && (
                <button
                  className="btn-primary"
                  onClick={() => setIsPaymentOpen(true)}
                  style={{ marginBottom: 0, gap: 6, padding: "8px 16px" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add_circle</span>
                  {t("supplierDebts.payment_modal.title")}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {isLoading ? (
            <div style={{ padding: "28px 32px" }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ display: "flex", gap: 16, marginBottom: 18, alignItems: "center" }}>
                  <div className="skeleton" style={{ height: 14, flex: 2 }} />
                  <div className="skeleton" style={{ height: 14, width: 110 }} />
                  <div className="skeleton" style={{ height: 14, width: 110 }} />
                  <div className="skeleton" style={{ height: 14, width: 80 }} />
                </div>
              ))}
            </div>
          ) : tab === "purchases" ? (
            detail && detail.purchases.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <TH>{t("purchases.table.reference", { defaultValue: "Référence" })}</TH>
                    <TH>{t("purchases.table.date", { defaultValue: "Date" })}</TH>
                    <TH>{t("purchases.table.total", { defaultValue: "Total" })}</TH>
                    <TH>{t("purchases.table.paid", { defaultValue: "Payé" })}</TH>
                    <TH>{t("supplierDebts.supplier_debts.remaining")}</TH>
                    <TH>{t("sales.table.status")}</TH>
                  </tr>
                </thead>
                <tbody>
                  {detail.purchases.map((purchase) => (
                    <tr key={purchase.id}>
                      <TD>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, letterSpacing: "-0.01em" }}>
                          {purchase.reference}
                        </span>
                      </TD>
                      <TD style={{ color: "var(--color-secondary)" }}>{formatDate(purchase.createdAt)}</TD>
                      <TD style={{ fontWeight: 600 }}>{formatCurrency(purchase.total)}</TD>
                      <TD style={{ color: "var(--color-tertiary)", fontWeight: 600 }}>{formatCurrency(purchase.amountPaid)}</TD>
                      <TD>
                        <span style={{ fontWeight: 700, color: purchase.remaining > 0 ? "var(--color-error)" : "var(--color-tertiary)", fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}>
                          {formatCurrency(purchase.remaining)}
                        </span>
                      </TD>
                      <TD>
                        <PaymentStatusBadge
                          amountPaid={purchase.amountPaid}
                          total={purchase.total}
                          compact
                        />
                      </TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <TabEmptyState
                icon="shopping_cart"
                title={t("purchases.table.no_purchases_found", { defaultValue: "Aucun achat" })}
                description={t("supplierDebts.supplier_debts.no_purchases_desc")}
              />
            )
          ) : tab === "payments" ? (
            detail && detail.payments.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <TH>{t("sales.table.date")}</TH>
                    <TH>{t("supplierDebts.supplier_debts.total_paid")}</TH>
                    <TH>{t("supplierDebts.payment_modal.method")}</TH>
                    <TH>{t("supplierDebts.payment_modal.reference")}</TH>
                    <TH>{t("supplierDebts.payment_modal.note")}</TH>
                    {can("supplierPayments.delete") && <TH></TH>}
                  </tr>
                </thead>
                <tbody>
                  {detail.payments.map((p) => (
                    <tr key={p.id}>
                      <TD style={{ color: "var(--color-secondary)" }}>{formatDateTime(p.createdAt)}</TD>
                      <TD>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--color-tertiary)", letterSpacing: "-0.01em", fontSize: 14 }}>
                          +{formatCurrency(p.amount)}
                        </span>
                      </TD>
                      <TD style={{ color: "var(--color-secondary)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 6, flexDirection: isRtl ? "row-reverse" : "row" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{methodIcon(p.paymentMethod)}</span>
                          {t("common.payment_methods." + p.paymentMethod)}
                        </span>
                      </TD>
                      <TD style={{ color: "var(--color-secondary)", fontFamily: "var(--font-display)" }}>
                        {p.reference ?? <span style={{ opacity: 0.4 }}>—</span>}
                      </TD>
                      <TD style={{ color: "var(--color-secondary)" }}>
                        {p.notes ?? <span style={{ opacity: 0.4 }}>—</span>}
                      </TD>
                      {can("supplierPayments.delete") && (
                        <TD style={{ textAlign: isRtl ? "left" : "right" }}>
                          <button
                            onClick={() => handleDeletePayment(p.id)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "var(--color-error)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: 4,
                            }}
                            title="Supprimer"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                          </button>
                        </TD>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <TabEmptyState
                icon="payments"
                title={t("supplierDebts.supplier_debts.no_payments")}
                description={t("supplierDebts.supplier_debts.no_payments_desc")}
              />
            )
          ) : (
            /* Timeline Account Statement Tab */
            detail && detail.timeline && detail.timeline.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <TH>{t("statement.date")}</TH>
                    <TH>{t("statement.type")}</TH>
                    <TH>{t("statement.ref")}</TH>
                    <TH>{t("statement.amount")}</TH>
                    <TH>{t("statement.balance")}</TH>
                  </tr>
                </thead>
                <tbody>
                  {detail.timeline.map((tx, idx) => {
                    const isPurchase = tx.type === "purchase";
                    return (
                      <tr key={idx}>
                        <TD style={{ color: "var(--color-secondary)" }}>{formatDate(tx.date)}</TD>
                        <TD style={{ fontWeight: 600, color: isPurchase ? "#1e1810" : "var(--color-tertiary)" }}>
                          {isPurchase ? t("statement.purchase") : t("statement.payment")}
                        </TD>
                        <TD style={{ fontFamily: "var(--font-display)", fontSize: 13 }}>{tx.reference}</TD>
                        <TD style={{ fontWeight: 700, color: isPurchase ? "var(--color-on-surface)" : "var(--color-tertiary)" }}>
                          {isPurchase ? "" : "-"}{formatCurrency(tx.amount)}
                        </TD>
                        <TD style={{ fontWeight: 700, fontFamily: "var(--font-display)" }}>
                          {formatCurrency(tx.runningBalance)}
                        </TD>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <TabEmptyState
                icon="list_alt"
                title={t("supplierDebts.supplier_debts.timeline")}
                description={t("supplierDebts.supplier_debts.no_statement_desc")}
              />
            )
          )}
        </div>
      </div>

      {/* ── Payment Sub-Modal ── */}
      {detail && (
        <SupplierPaymentFormModal
          isOpen={isPaymentOpen}
          supplierId={detail.id}
          supplierName={detail.name}
          currentDebt={detail.summary.currentDebt}
          onClose={() => setIsPaymentOpen(false)}
          onSuccess={() => {
            onPaymentSuccess();
            setIsPaymentOpen(false);
          }}
        />
      )}
    </div>,
    document.body
  );
}
