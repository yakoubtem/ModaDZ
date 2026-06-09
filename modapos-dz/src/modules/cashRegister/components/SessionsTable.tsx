import { formatCurrency, formatDate, initials } from "@/lib/utils";
import type { CashSession } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

function SkeletonRow() {
  return (
    <tr>
      {[150, 140, 140, 110, 110, 110, 110, 80, 80].map((w, i) => (
        <td key={i} style={{ padding: "20px 24px" }}>
          {i === 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="skeleton" style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 14, width: "70%" }} />
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

function EmptyState() {
  const { t } = useTranslation();
  return (
    <tr>
      <td colSpan={9}>
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
              point_of_sale
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
              {t("cashRegister.tables.no_sessions")}
            </p>
          </div>
        </div>
      </td>
    </tr>
  );
}

interface SessionsTableProps {
  sessions: CashSession[];
  isLoading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onViewDetail: (id: number) => void;
  onCloseSession?: (session: CashSession) => void;
  onPageChange: (p: number) => void;
  canCloseSession?: boolean;
}

export function SessionsTable({
  sessions,
  isLoading,
  total,
  page,
  pageSize,
  onViewDetail,
  onCloseSession,
  onPageChange,
  canCloseSession,
}: SessionsTableProps) {
  const { t, isRtl } = useTranslation();
  const totalPages = Math.ceil(total / pageSize);

  const getDifferenceColor = (diff: number) => {
    if (diff === 0) return "var(--color-success)";
    if (Math.abs(diff) <= 1000) return "var(--color-warning)";
    return "var(--color-error)";
  };

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
      <div
        style={{
          padding: "18px 28px",
          borderBottom: "1px solid rgba(208,197,175,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: isRtl ? "row-reverse" : "row",
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
          {t("cashRegister.tabs.sessions")}
        </p>
        {!isLoading && total > 0 && (
          <span
            style={{
              fontSize: "var(--text-label-sm)",
              color: "var(--color-secondary)",
              fontWeight: 500,
            }}
          >
            {total} {t("cashRegister.tabs.sessions", { count: total })}
          </span>
        )}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: 1050, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {[
                t("cashRegister.tables.user"),
                t("cashRegister.tables.opened"),
                t("cashRegister.tables.closed"),
                t("cashRegister.tables.opening"),
                t("cashRegister.tables.expected"),
                t("cashRegister.tables.actual"),
                t("cashRegister.tables.difference"),
                t("cashRegister.tables.status"),
                "",
              ].map((col, i) => (
                <th
                  key={i}
                  style={{
                    padding: "12px 24px",
                    textAlign: i === 8 ? (isRtl ? "left" : "right") : (isRtl ? "right" : "left"),
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
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              : sessions.length === 0
              ? <EmptyState />
              : sessions.map((s) => {
                  const hasDiff = s.difference !== undefined && s.difference !== null;
                  const isClosed = s.status === "closed";

                  return (
                    <tr
                      key={s.id}
                      onClick={() => onViewDetail(s.id)}
                      style={{ cursor: "pointer", transition: "background 0.12s ease" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "rgba(212,175,55,0.04)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {/* User */}
                      <td style={{ padding: "16px 24px", borderBottom: "1px solid rgba(208,197,175,0.1)", textAlign: isRtl ? "right" : "left" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "var(--radius-full)",
                              background: "rgba(212,175,55,0.12)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 11,
                              fontWeight: 700,
                              color: "var(--color-primary)",
                              flexShrink: 0,
                            }}
                          >
                            {s.user ? initials(s.user.name) : "—"}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: "var(--text-body-sm)", color: "var(--color-on-surface)" }}>
                              {s.user?.name ?? "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Opened At */}
                      <td style={{ padding: "16px 24px", borderBottom: "1px solid rgba(208,197,175,0.1)", color: "var(--color-on-surface)", fontSize: "var(--text-body-sm)", textAlign: isRtl ? "right" : "left" }}>
                        {formatDate(s.openedAt)}
                      </td>

                      {/* Closed At */}
                      <td style={{ padding: "16px 24px", borderBottom: "1px solid rgba(208,197,175,0.1)", color: "var(--color-secondary)", fontSize: "var(--text-body-sm)", textAlign: isRtl ? "right" : "left" }}>
                        {s.closedAt ? formatDate(s.closedAt) : "—"}
                      </td>

                      {/* Opening Balance */}
                      <td style={{ padding: "16px 24px", borderBottom: "1px solid rgba(208,197,175,0.1)", fontSize: "var(--text-body-sm)", color: "var(--color-on-surface)", textAlign: isRtl ? "right" : "left" }}>
                        {formatCurrency(s.openingBalance)}
                      </td>

                      {/* Expected Balance */}
                      <td style={{ padding: "16px 24px", borderBottom: "1px solid rgba(208,197,175,0.1)", fontSize: "var(--text-body-sm)", color: "var(--color-on-surface)", textAlign: isRtl ? "right" : "left" }}>
                        {formatCurrency(s.expectedBalance)}
                      </td>

                      {/* Actual Balance */}
                      <td style={{ padding: "16px 24px", borderBottom: "1px solid rgba(208,197,175,0.1)", fontSize: "var(--text-body-sm)", color: isClosed ? "var(--color-on-surface)" : "var(--color-secondary)", textAlign: isRtl ? "right" : "left" }}>
                        {isClosed && s.actualBalance !== null && s.actualBalance !== undefined
                          ? formatCurrency(s.actualBalance)
                          : "—"}
                      </td>

                      {/* Difference */}
                      <td style={{ padding: "16px 24px", borderBottom: "1px solid rgba(208,197,175,0.1)", textAlign: isRtl ? "right" : "left" }}>
                        {isClosed && hasDiff ? (
                          <span
                            style={{
                              fontFamily: "var(--font-display)",
                              fontWeight: 700,
                              fontSize: 14,
                              color: getDifferenceColor(s.difference!),
                            }}
                          >
                            {s.difference! > 0 ? `+${formatCurrency(s.difference!)}` : formatCurrency(s.difference!)}
                          </span>
                        ) : (
                          <span style={{ color: "var(--color-secondary)" }}>—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "16px 24px", borderBottom: "1px solid rgba(208,197,175,0.1)", textAlign: isRtl ? "right" : "left" }}>
                        {s.status === "open" ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "4px 10px",
                              borderRadius: "var(--radius-full)",
                              fontSize: 11,
                              fontWeight: 700,
                              background: "rgba(16,185,129,0.1)",
                              color: "var(--color-success)",
                            }}
                          >
                            ● {t("cashRegister.close_modal.balanced", { defaultValue: "Actif" })}
                          </span>
                        ) : (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "4px 10px",
                              borderRadius: "var(--radius-full)",
                              fontSize: 11,
                              fontWeight: 600,
                              background: "rgba(107,114,128,0.1)",
                              color: "var(--color-secondary)",
                            }}
                          >
                            {t("cashRegister.close_modal.confirm", { defaultValue: "Clôturée" })}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td
                        style={{ padding: "16px 24px", borderBottom: "1px solid rgba(208,197,175,0.1)", textAlign: isRtl ? "left" : "right" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div style={{ display: "flex", gap: 6, justifyContent: isRtl ? "flex-start" : "flex-end", alignItems: "center" }}>
                          <button
                            className="btn-border"
                            style={{ padding: "6px 10px", fontSize: 11, gap: 4 }}
                            onClick={() => onViewDetail(s.id)}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                              visibility
                            </span>
                            {t("cashRegister.tables.session_details")}
                          </button>
                          
                          {!isClosed && canCloseSession && onCloseSession && (
                            <button
                              className="btn-border"
                              style={{
                                padding: "6px 10px",
                                fontSize: 11,
                                background: "rgba(239,68,68,0.05)",
                                border: "1px solid rgba(239,68,68,0.2)",
                                color: "var(--color-error)",
                                gap: 4,
                              }}
                              onClick={() => onCloseSession(s)}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                                lock
                              </span>
                              {t("cashRegister.widgets.close_shortcut")}
                            </button>
                          )}
                        </div>
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
            flexDirection: isRtl ? "row-reverse" : "row",
          }}
        >
          <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)" }}>
            {t("supplierDebts.table.display_info", {
              from: Math.min((page - 1) * pageSize + 1, total),
              to: Math.min(page * pageSize, total),
              total,
            })}
          </p>
          <div style={{ display: "flex", gap: 4, flexDirection: isRtl ? "row-reverse" : "row" }}>
            <button
              className="page-btn"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              style={{ opacity: page <= 1 ? 0.35 : 1 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                chevron_left
              </span>
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
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                chevron_right
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
