import { useState } from "react";
import { Eye, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import type { Purchase } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/modules/auth/AuthContext";
import { PaymentStatusBadge } from "@/components/ui/PaymentStatusBadge";

interface PurchaseTableProps {
  purchases: Purchase[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  onViewDetails: (purchase: Purchase) => void;
  onDelete: (purchase: Purchase) => void;
  onPageChange: (page: number) => void;
}

export function PurchaseTable({
  purchases,
  total,
  page,
  pageSize,
  isLoading,
  onViewDetails,
  onDelete,
  onPageChange,
}: PurchaseTableProps) {
  const { t, isRtl } = useTranslation();
  const { can } = useAuth();
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const totalPages = Math.ceil(total / pageSize);
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  if (isLoading) {
    return (
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 52, borderRadius: 8 }} />
        ))}
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
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
          shopping_cart
        </span>
        <p style={{ fontSize: "var(--text-body-md)", color: "var(--color-secondary)" }}>
          {t("purchases.table.no_purchases") || "Aucun achat enregistré"}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-body-sm)" }}>
          <thead>
            <tr style={{ background: "rgba(245,243,238,0.7)", borderBottom: "1px solid rgba(208,197,175,0.3)" }}>
              {[
                t("purchases.table.reference"),
                t("purchases.table.supplier"),
                t("purchases.table.date"),
                t("purchases.table.subtotal"),
                t("purchases.table.discount"),
                t("purchases.table.total"),
                t("purchases.table.amount_paid"),
                t("purchases.table.remaining_debt"),
                t("purchases.table.status"),
              ].map((h, idx) => (
                <th
                  key={idx}
                  style={{
                    padding: "14px 20px",
                    textAlign: isRtl ? "right" : "left",
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
              <th
                style={{
                  padding: "14px 20px",
                  textAlign: isRtl ? "left" : "right",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-secondary)",
                  whiteSpace: "nowrap",
                }}
              >
                {t("purchases.table.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase) => {
              const remainingDebt = Math.max(0, purchase.total - purchase.amountPaid);
              return (
                <tr
                  key={purchase.id}
                  style={{
                    borderBottom: "1px solid rgba(208,197,175,0.15)",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(212,175,55,0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "14px 20px", fontWeight: 700, color: "var(--color-on-surface)" }}>
                    {purchase.reference}
                  </td>
                  <td style={{ padding: "14px 20px", color: "var(--color-on-surface)" }}>
                    {purchase.supplier?.name || "—"}
                  </td>
                  <td style={{ padding: "14px 20px", color: "var(--color-secondary)" }}>
                    {formatDate(purchase.createdAt)}
                  </td>
                  <td style={{ padding: "14px 20px", fontVariantNumeric: "tabular-nums" }}>
                    {formatCurrency(purchase.subtotal)}
                  </td>
                  <td style={{ padding: "14px 20px", fontVariantNumeric: "tabular-nums", color: "var(--color-secondary)" }}>
                    {formatCurrency(purchase.discount)}
                  </td>
                  <td style={{ padding: "14px 20px", fontWeight: 600, color: "var(--color-on-surface)", fontVariantNumeric: "tabular-nums" }}>
                    {formatCurrency(purchase.total)}
                  </td>
                  <td style={{ padding: "14px 20px", color: "var(--color-tertiary)", fontVariantNumeric: "tabular-nums" }}>
                    {formatCurrency(purchase.amountPaid)}
                  </td>
                  <td
                    style={{
                      padding: "14px 20px",
                      fontWeight: 700,
                      color: remainingDebt > 0 ? "var(--color-error)" : "var(--color-tertiary)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatCurrency(remainingDebt)}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <PaymentStatusBadge amountPaid={purchase.amountPaid} total={purchase.total} compact />
                  </td>
                  <td style={{ padding: "14px 20px", textAlign: isRtl ? "left" : "right" }}>
                    {deleteConfirmId === purchase.id ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                        <button
                          onClick={() => { onDelete(purchase); setDeleteConfirmId(null); }}
                          className="btn-primary"
                          style={{ padding: "6px 14px", fontSize: 12, height: 36, background: "var(--color-error)" }}
                        >
                          {t("common.buttons.yes")}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          style={{
                            height: 36,
                            padding: "0 12px",
                            background: "none",
                            border: "1px solid rgba(208,197,175,0.3)",
                            borderRadius: "var(--radius-md)",
                            cursor: "pointer",
                            color: "var(--color-secondary)",
                            fontSize: 12,
                          }}
                        >
                          {t("common.buttons.no")}
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                        <button
                          onClick={() => onViewDetails(purchase)}
                          title={t("purchases.purchase_details") || "Détails de l'achat"}
                          style={{
                            width: 36,
                            height: 36,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "var(--radius-md)",
                            background: "none",
                            border: "1px solid rgba(208,197,175,0.2)",
                            cursor: "pointer",
                            color: "var(--color-secondary)",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-on-surface)"; e.currentTarget.style.background = "rgba(208,197,175,0.15)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-secondary)"; e.currentTarget.style.background = "none"; }}
                        >
                          <Eye style={{ width: 14, height: 14 }} />
                        </button>
                        {can("purchases.manage") && (
                          <button
                            onClick={() => setDeleteConfirmId(purchase.id)}
                            title={t("common.buttons.delete")}
                            style={{
                              width: 36,
                              height: 36,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "var(--radius-md)",
                              background: "none",
                              border: "1px solid rgba(208,197,175,0.2)",
                              cursor: "pointer",
                              color: "var(--color-secondary)",
                              transition: "all 0.15s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = "var(--color-error)";
                              e.currentTarget.style.background = "rgba(220,38,38,0.06)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = "var(--color-secondary)";
                              e.currentTarget.style.background = "none";
                            }}
                          >
                            <Trash2 style={{ width: 14, height: 14 }} />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
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
            {t("purchases.table.pagination", { from, to, total }) || `Affichage de ${from} à ${to} sur ${total} achats`}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              style={{
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "var(--radius-md)",
                background: "none",
                border: "1px solid rgba(208,197,175,0.3)",
                cursor: page <= 1 ? "default" : "pointer",
                opacity: page <= 1 ? 0.4 : 1,
                color: "var(--color-secondary)",
              }}
            >
              {isRtl ? <ChevronRight style={{ width: 16, height: 16 }} /> : <ChevronLeft style={{ width: 16, height: 16 }} />}
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  style={{
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: p === page ? 700 : 500,
                    borderRadius: "var(--radius-md)",
                    border: "none",
                    cursor: "pointer",
                    background: p === page ? "var(--color-primary)" : "transparent",
                    color: p === page ? "white" : "var(--color-secondary)",
                    transition: "all 0.15s ease",
                  }}
                >
                  {p}
                </button>
              );
            })}
            {totalPages > 5 && (
              <span style={{ fontSize: 12, color: "var(--color-secondary)", padding: "0 4px" }}>…{totalPages}</span>
            )}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              style={{
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "var(--radius-md)",
                background: "none",
                border: "1px solid rgba(208,197,175,0.3)",
                cursor: page >= totalPages ? "default" : "pointer",
                opacity: page >= totalPages ? 0.4 : 1,
                color: "var(--color-secondary)",
              }}
            >
              {isRtl ? <ChevronLeft style={{ width: 16, height: 16 }} /> : <ChevronRight style={{ width: 16, height: 16 }} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
