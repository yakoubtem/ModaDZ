import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Expense } from "@/types";
import { useIPC } from "@/hooks/useIPC";
import { toast } from "sonner";
import { useAuth } from "@/modules/auth/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";

interface ExpenseTableProps {
  expenses: Expense[];
  isLoading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => void;
  onPageChange: (p: number) => void;
}

export function ExpenseTable({
  expenses,
  isLoading,
  total,
  page,
  pageSize,
  onEdit,
  onDelete,
  onPageChange,
}: ExpenseTableProps) {
  const { can } = useAuth();
  const { t, isRtl } = useTranslation();
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const totalPages = Math.ceil(total / pageSize);
  const api = useIPC();

  const handleDownload = async (path?: string | null) => {
    if (!path) return;
    try {
      await api("expenses:downloadReceipt", path);
    } catch {
      toast.error(t("expenses.toasts.receipt_download_error"));
    }
  };

  const handlePreview = (path?: string | null) => {
    if (!path) return;
    window.open(`media://${path}`, "_blank");
  };

  if (isLoading && expenses.length === 0) {
    return (
      <div
        className="glass-panel"
        style={{ borderRadius: "var(--radius-xl)", padding: 24, display: "flex", flexDirection: "column", gap: 12 }}
      >
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 52, borderRadius: 8 }} />
        ))}
      </div>
    );
  }

  return (
    <div
      className="glass-panel"
      style={{ borderRadius: "var(--radius-xl)", overflow: "hidden" }}
    >
      <table className="table-base">
        <thead>
          <tr>
            <th>{t("expenses.table.date")}</th>
            <th>{t("expenses.table.title")}</th>
            <th>{t("expenses.table.category")}</th>
            <th style={{ textAlign: isRtl ? "left" : "right" }}>{t("expenses.table.amount")}</th>
            <th>{t("expenses.table.supplier")}</th>
            <th>{t("expenses.table.payment_method")}</th>
            <th>{t("expenses.table.receipt")}</th>
            <th>{t("expenses.table.notes")}</th>
            <th style={{ textAlign: isRtl ? "left" : "right" }}>{t("expenses.table.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr
              key={expense.id}
              onMouseEnter={() => setHoveredRow(expense.id)}
              onMouseLeave={() => {
                setHoveredRow(null);
                if (deleteConfirm === expense.id) setDeleteConfirm(null);
              }}
              style={{
                background: hoveredRow === expense.id ? "rgba(255,255,255,0.8)" : "transparent",
              }}
            >
              {/* Date */}
              <td>
                <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--color-secondary)" }}>
                  {formatDate(expense.expenseDate)}
                </span>
              </td>

              {/* Title */}
              <td>
                <span style={{ fontWeight: 600, color: "var(--color-on-surface)" }}>
                  {expense.title}
                </span>
              </td>

              {/* Category */}
              <td>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 12px",
                    borderRadius: "var(--radius-full)",
                    background: "var(--color-surface-container-high)",
                    fontSize: "var(--text-label-sm)",
                    fontWeight: "var(--fw-label-sm)",
                    letterSpacing: "var(--ls-label-sm)",
                    color: "var(--color-on-surface-variant)",
                  }}
                >
                  {expense.category}
                </span>
              </td>

              {/* Amount */}
              <td style={{ textAlign: isRtl ? "left" : "right" }}>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    color: "var(--color-error)",
                    fontSize: "var(--text-label-md)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  -{formatCurrency(expense.amount)}
                </span>
              </td>

              {/* Supplier */}
              <td>
                <span style={{ color: "var(--color-secondary)", fontSize: "var(--text-body-sm)" }}>
                  {expense.supplier || "—"}
                </span>
              </td>

              {/* Payment Method */}
              <td>
                <span style={{ color: "var(--color-secondary)", fontSize: "var(--text-body-sm)" }}>
                  {expense.paymentMethod || "—"}
                </span>
              </td>

              {/* Receipt */}
              <td>
                {expense.receiptPath ? (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => handlePreview(expense.receiptPath)}
                      className="btn-border"
                      style={{ padding: "4px 8px", fontSize: 11 }}
                    >
                      {t("expenses.table.view")}
                    </button>
                    <button
                      onClick={() => handleDownload(expense.receiptPath)}
                      className="btn-border"
                      style={{ padding: "4px 8px", fontSize: 11 }}
                    >
                      {t("expenses.table.download")}
                    </button>
                  </div>
                ) : (
                  <span style={{ color: "var(--color-secondary)", fontSize: "var(--text-body-sm)" }}>—</span>
                )}
              </td>

              {/* Notes */}
              <td>
                <span
                  style={{
                    color: "var(--color-secondary)",
                    fontSize: "var(--text-body-sm)",
                    maxWidth: 180,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "inline-block",
                  }}
                >
                  {expense.notes || expense.description || "—"}
                </span>
              </td>

              {/* Actions */}
              <td style={{ textAlign: isRtl ? "left" : "right" }}>
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    justifyContent: isRtl ? "flex-start" : "flex-end",
                    opacity: hoveredRow === expense.id ? 1 : 0,
                    transition: "opacity 0.15s ease",
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(expense);
                    }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "var(--radius-md)",
                      border: "1px solid rgba(208,197,175,0.3)",
                      background: "rgba(255,255,255,0.8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "var(--color-primary)",
                    }}
                    title={t("expenses.categories.edit")}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                  </button>

                  {can("expenses.delete") && (
                    deleteConfirm === expense.id ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(expense.id);
                          setDeleteConfirm(null);
                        }}
                        style={{
                          height: 32,
                          padding: "0 12px",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid rgba(186,26,26,0.3)",
                          background: "rgba(186,26,26,0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: "var(--color-error)",
                          fontSize: 12,
                          fontWeight: 700,
                          gap: 4,
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check</span>
                        {t("expenses.table.confirm_delete")}
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(expense.id);
                        }}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "var(--radius-md)",
                          border: "1px solid rgba(186,26,26,0.2)",
                          background: "rgba(186,26,26,0.04)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: "var(--color-error)",
                        }}
                        title={t("expenses.categories.archive")}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                      </button>
                    )
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
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
            {t("expenses.table.pagination", {
              start: (page - 1) * pageSize + 1,
              end: Math.min(page * pageSize, total),
              total: total,
            })}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn-border"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              style={{ opacity: page === 1 ? 0.4 : 1 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                {isRtl ? "chevron_right" : "chevron_left"}
              </span>
            </button>
            <button
              className="btn-border"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              style={{ opacity: page === totalPages ? 0.4 : 1 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                {isRtl ? "chevron_left" : "chevron_right"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
