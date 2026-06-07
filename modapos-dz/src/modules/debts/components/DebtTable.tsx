import { formatCurrency, formatDate, initials } from "@/lib/utils";
import type { CustomerDebtSummary } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

// ─── Debt Status Badge ────────────────────────────────────

function getDebtStatusInfo(debt: number): {
  key: string;
  chipClass: string;
  dotColor: string;
} {
  if (debt <= 0)
    return { key: "completed", chipClass: "chip chip-success", dotColor: "var(--color-tertiary)" };
  if (debt < 5000)
    return { key: "low", chipClass: "chip chip-success", dotColor: "var(--color-tertiary)" };
  if (debt < 50000)
    return { key: "medium", chipClass: "chip", dotColor: "var(--color-warning)" };
  return { key: "high", chipClass: "chip chip-error", dotColor: "var(--color-error)" };
}

// ─── Skeleton Row ─────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr>
      {[180, 120, 130, 130, 130, 110, 90, 80].map((w, i) => (
        <td key={i} style={{ padding: "20px 24px" }}>
          {i === 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 14, width: "70%", marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 11, width: "40%" }} />
              </div>
            </div>
          ) : (
            <div className="skeleton" style={{ height: 14, width: w, borderRadius: 4 }} />
          )}
        </td>
      ))}
    </tr>
  );
}

// ─── Empty State ──────────────────────────────────────────

function EmptyState() {
  const { t } = useTranslation();
  return (
    <tr>
      <td colSpan={8}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "72px 24px",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "var(--radius-xl)",
              background: "rgba(208,197,175,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 32, color: "var(--color-outline)", opacity: 0.6 }}
            >
              account_balance_wallet
            </span>
          </div>
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                fontWeight: 600,
                fontSize: "var(--text-body-md)",
                color: "var(--color-on-surface)",
                marginBottom: 6,
              }}
            >
              {t("debts.table.no_debtors_found")}
            </p>
            <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)" }}>
              {t("debts.table.adjust_filters_desc")}
            </p>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────

interface DebtTableProps {
  customers: CustomerDebtSummary[];
  isLoading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onViewDetail: (id: number) => void;
  onPageChange: (p: number) => void;
}

export function DebtTable({
  customers,
  isLoading,
  total,
  page,
  pageSize,
  onViewDetail,
  onPageChange,
}: DebtTableProps) {
  const { t, isRtl } = useTranslation();
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(208,197,175,0.3)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-soft)",
        overflow: "hidden",
      }}
    >
      {/* Table header with count */}
      <div
        style={{
          padding: "18px 28px",
          borderBottom: "1px solid rgba(208,197,175,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <p
          style={{
            fontSize: "var(--text-label-sm)",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-secondary)",
          }}
        >
          {t("debts.table.list_header")}
        </p>
        {!isLoading && total > 0 && (
          <span
            style={{
              fontSize: "var(--text-label-sm)",
              color: "var(--color-secondary)",
              fontWeight: 500,
            }}
          >
            {t("debts.table.result_count", { count: total })}
          </span>
        )}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            minWidth: 960,
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              {[
                t("debts.table.debtor"),
                t("debts.table.phone"),
                t("debts.customer_debts.total_purchases"),
                t("debts.customer_debts.total_paid"),
                t("debts.table.current_debt"),
                t("debts.table.last_purchase"),
                t("sales.table.status"),
                ""
              ].map(
                (col, i) => (
                  <th
                    key={i}
                    style={{
                      padding: "12px 24px",
                      textAlign: i === 7 ? (isRtl ? "left" : "right") : (isRtl ? "right" : "left"),
                      fontSize: "var(--text-label-sm)",
                      fontWeight: 700,
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                      color: "var(--color-secondary)",
                      borderBottom: "1px solid rgba(208,197,175,0.2)",
                      whiteSpace: "nowrap",
                      background: "rgba(248,246,240,0.6)",
                    }}
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              : customers.length === 0
              ? <EmptyState />
              : customers.map((c) => {
                  const status = getDebtStatusInfo(c.currentDebt);
                  const statusLabel = status.key === "completed" ? t("common.status.completed") : t(`debts.status.${status.key}`);
                  return (
                    <tr
                      key={c.id}
                      onClick={() => onViewDetail(c.id)}
                      style={{ cursor: "pointer", transition: "background 0.12s ease" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "rgba(212,175,55,0.04)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {/* Client */}
                      <td style={{ padding: "18px 24px", borderBottom: "1px solid rgba(208,197,175,0.1)", textAlign: isRtl ? "right" : "left" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "var(--radius-full)",
                              background:
                                c.currentDebt > 50000
                                  ? "rgba(186,26,26,0.1)"
                                  : c.currentDebt > 5000
                                  ? "rgba(180,83,9,0.08)"
                                  : "rgba(212,175,55,0.12)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 13,
                              fontWeight: 700,
                              color:
                                c.currentDebt > 50000
                                  ? "var(--color-error)"
                                  : c.currentDebt > 5000
                                  ? "var(--color-warning)"
                                  : "var(--color-primary)",
                              flexShrink: 0,
                              letterSpacing: "-0.01em",
                            }}
                          >
                            {initials(c.name)}
                          </div>
                          <div>
                            <p
                              style={{
                                fontWeight: 600,
                                fontSize: "var(--text-body-sm)",
                                color: "var(--color-on-surface)",
                                marginBottom: 2,
                              }}
                            >
                              {c.name}
                            </p>
                            <p style={{ fontSize: 11, color: "var(--color-secondary)" }}>
                              {t("debts.table.sales_count", { count: c.salesCount })}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td style={{ padding: "18px 24px", borderBottom: "1px solid rgba(208,197,175,0.1)", color: "var(--color-secondary)", fontSize: "var(--text-body-sm)", textAlign: isRtl ? "right" : "left" }}>
                        {c.phone ?? "—"}
                      </td>

                      {/* Total purchases */}
                      <td style={{ padding: "18px 24px", borderBottom: "1px solid rgba(208,197,175,0.1)", fontWeight: 600, fontSize: "var(--text-body-sm)", color: "var(--color-on-surface)", textAlign: isRtl ? "right" : "left" }}>
                        {formatCurrency(c.totalPurchases)}
                      </td>

                      {/* Total paid */}
                      <td style={{ padding: "18px 24px", borderBottom: "1px solid rgba(208,197,175,0.1)", color: "var(--color-tertiary)", fontWeight: 600, fontSize: "var(--text-body-sm)", textAlign: isRtl ? "right" : "left" }}>
                        {formatCurrency(c.totalPaid)}
                      </td>

                      {/* Current debt */}
                      <td style={{ padding: "18px 24px", borderBottom: "1px solid rgba(208,197,175,0.1)", textAlign: isRtl ? "right" : "left" }}>
                        <span
                          style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 700,
                            fontSize: 15,
                            letterSpacing: "-0.01em",
                            color:
                              c.currentDebt > 50000
                                ? "var(--color-error)"
                                : c.currentDebt > 5000
                                ? "var(--color-warning)"
                                : c.currentDebt > 0
                                ? "var(--color-on-surface)"
                                : "var(--color-tertiary)",
                          }}
                        >
                          {formatCurrency(c.currentDebt)}
                        </span>
                      </td>

                      {/* Last purchase */}
                      <td style={{ padding: "18px 24px", borderBottom: "1px solid rgba(208,197,175,0.1)", color: "var(--color-secondary)", fontSize: "var(--text-body-sm)", textAlign: isRtl ? "right" : "left" }}>
                        {c.lastPurchaseDate ? formatDate(c.lastPurchaseDate) : "—"}
                      </td>

                      {/* Status badge */}
                      <td style={{ padding: "18px 24px", borderBottom: "1px solid rgba(208,197,175,0.1)", textAlign: isRtl ? "right" : "left" }}>
                        <span
                          className={status.chipClass}
                          style={
                            status.key === "medium"
                              ? { background: "rgba(180,83,9,0.08)", color: "var(--color-warning)", border: "1px solid rgba(180,83,9,0.2)" }
                              : undefined
                          }
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: status.dotColor,
                              display: "inline-block",
                              [isRtl ? "marginLeft" : "marginRight"]: 5,
                              flexShrink: 0,
                            }}
                          />
                          {statusLabel}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "18px 24px", borderBottom: "1px solid rgba(208,197,175,0.1)", textAlign: isRtl ? "left" : "right" }} onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn-border"
                          style={{ padding: "7px 16px", fontSize: 12, gap: 5, whiteSpace: "nowrap" }}
                          onClick={() => onViewDetail(c.id)}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
                            open_in_new
                          </span>
                          {t("debts.table.details_btn")}
                        </button>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 28px",
            borderTop: "1px solid rgba(208,197,175,0.15)",
          }}
        >
          <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)" }}>
            {t("debts.table.display_info", { from: Math.min((page - 1) * pageSize + 1, total), to: Math.min(page * pageSize, total), total })}
          </p>
          <div style={{ display: "flex", gap: 4 }}>
            <button
              className="page-btn"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              style={{ opacity: page <= 1 ? 0.35 : 1 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return (
                <button
                  key={p}
                  className={`page-btn${p === page ? " active" : ""}`}
                  onClick={() => onPageChange(p)}
                >
                  {p}
                </button>
              );
            })}
            <button
              className="page-btn"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              style={{ opacity: page >= totalPages ? 0.35 : 1 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
