import { useState } from "react";
import { Pencil, Trash2, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import type { SupplierWithStats } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/modules/auth/AuthContext";

interface SupplierTableProps {
  suppliers: SupplierWithStats[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  sortBy: "name" | "debt" | "createdAt";
  sortOrder: "asc" | "desc";
  onEdit: (supplier: SupplierWithStats) => void;
  onDelete: (supplier: SupplierWithStats) => void;
  onPageChange: (page: number) => void;
  onSort: (field: "name" | "debt" | "createdAt") => void;
}

export function SupplierTable({
  suppliers,
  total,
  page,
  pageSize,
  isLoading,
  onEdit,
  onDelete,
  onPageChange,
  onSort,
}: SupplierTableProps) {
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

  if (suppliers.length === 0) {
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
          local_shipping
        </span>
        <p style={{ fontSize: "var(--text-body-md)", color: "var(--color-secondary)" }}>
          {t("suppliers.table.no_suppliers")}
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
              <th
                onClick={() => onSort("name")}
                style={{
                  padding: "14px 20px",
                  textAlign: isRtl ? "right" : "left",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-secondary)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {t("suppliers.table.name")}
                  <ArrowUpDown style={{ width: 12, height: 12 }} />
                </div>
              </th>
              {[
                t("suppliers.table.phone"),
                t("suppliers.table.email"),
                t("suppliers.table.address"),
                t("suppliers.table.total_purchases"),
                t("suppliers.table.total_amount"),
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
                onClick={() => onSort("debt")}
                style={{
                  padding: "14px 20px",
                  textAlign: isRtl ? "right" : "left",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-secondary)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {t("suppliers.table.remaining_debt")}
                  <ArrowUpDown style={{ width: 12, height: 12 }} />
                </div>
              </th>
              <th
                onClick={() => onSort("createdAt")}
                style={{
                  padding: "14px 20px",
                  textAlign: isRtl ? "right" : "left",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-secondary)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {t("suppliers.table.last_purchase")}
                  <ArrowUpDown style={{ width: 12, height: 12 }} />
                </div>
              </th>
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
                {t("suppliers.table.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr
                key={supplier.id}
                style={{
                  borderBottom: "1px solid rgba(208,197,175,0.15)",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(212,175,55,0.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "14px 20px", fontWeight: 500, color: "var(--color-on-surface)" }}>
                  {supplier.name}
                </td>
                <td style={{ padding: "14px 20px", color: "var(--color-on-surface)" }}>
                  {supplier.phone || "—"}
                </td>
                <td style={{ padding: "14px 20px", color: "var(--color-secondary)" }}>
                  {supplier.email || "—"}
                </td>
                <td style={{ padding: "14px 20px", color: "var(--color-secondary)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {supplier.address || "—"}
                </td>
                <td style={{ padding: "14px 20px", fontVariantNumeric: "tabular-nums" }}>
                  {supplier.totalPurchases}
                </td>
                <td style={{ padding: "14px 20px", fontWeight: 600, color: "var(--color-on-surface)", fontVariantNumeric: "tabular-nums" }}>
                  {formatCurrency(supplier.totalAmount)}
                </td>
                <td
                  style={{
                    padding: "14px 20px",
                    fontWeight: 700,
                    color: supplier.remainingDebt > 0 ? "var(--color-error)" : "var(--color-tertiary)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatCurrency(supplier.remainingDebt)}
                </td>
                <td style={{ padding: "14px 20px", color: "var(--color-secondary)" }}>
                  {supplier.lastPurchaseDate ? formatDate(supplier.lastPurchaseDate) : "—"}
                </td>
                <td style={{ padding: "14px 20px", textAlign: isRtl ? "left" : "right" }}>
                  {deleteConfirmId === supplier.id ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                      <button
                        onClick={() => { onDelete(supplier); setDeleteConfirmId(null); }}
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
                      {can("suppliers.manage") && (
                        <>
                          <button
                            onClick={() => onEdit(supplier)}
                            title={t("common.buttons.edit")}
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
                            <Pencil style={{ width: 14, height: 14 }} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(supplier.id)}
                            title={t("common.buttons.delete")}
                            disabled={supplier.totalPurchases > 0}
                            style={{
                              width: 36,
                              height: 36,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "var(--radius-md)",
                              background: "none",
                              border: "1px solid rgba(208,197,175,0.2)",
                              cursor: supplier.totalPurchases > 0 ? "not-allowed" : "pointer",
                              color: "var(--color-secondary)",
                              opacity: supplier.totalPurchases > 0 ? 0.4 : 1,
                              transition: "all 0.15s",
                            }}
                            onMouseEnter={(e) => {
                              if (supplier.totalPurchases === 0) {
                                e.currentTarget.style.color = "var(--color-error)";
                                e.currentTarget.style.background = "rgba(220,38,38,0.06)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (supplier.totalPurchases === 0) {
                                e.currentTarget.style.color = "var(--color-secondary)";
                                e.currentTarget.style.background = "none";
                              }
                            }}
                          >
                            <Trash2 style={{ width: 14, height: 14 }} />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
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
            {t("suppliers.table.pagination", { from, to, total })}
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
