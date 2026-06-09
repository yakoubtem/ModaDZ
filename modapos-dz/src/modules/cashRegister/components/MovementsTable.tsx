import { formatCurrency, formatDate, initials } from "@/lib/utils";
import type { CashMovement } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

function SkeletonRow() {
  return (
    <tr>
      {[160, 150, 130, 120, 260].map((w, i) => (
        <td key={i} style={{ padding: "18px 24px" }}>
          {i === 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="skeleton" style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 14, width: "60%" }} />
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
      <td colSpan={5}>
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
              swap_horiz
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
              {t("cashRegister.tables.no_movements")}
            </p>
          </div>
        </div>
      </td>
    </tr>
  );
}

interface MovementsTableProps {
  movements: CashMovement[];
  isLoading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
}

export function MovementsTable({
  movements,
  isLoading,
  total,
  page,
  pageSize,
  onPageChange,
}: MovementsTableProps) {
  const { t, isRtl } = useTranslation();
  const totalPages = Math.ceil(total / pageSize);

  const getMovementTypeDetails = (type: string) => {
    switch (type) {
      case "sale":
        return {
          label: t("cashRegister.types.sale"),
          isInput: true,
          chipStyle: { background: "rgba(16,185,129,0.08)", color: "var(--color-success)", border: "1px solid rgba(16,185,129,0.15)" },
          icon: "shopping_cart",
        };
      case "cash_in":
        return {
          label: t("cashRegister.types.cash_in"),
          isInput: true,
          chipStyle: { background: "rgba(39,104,104,0.08)", color: "var(--color-tertiary)", border: "1px solid rgba(39,104,104,0.15)" },
          icon: "add_circle",
        };
      case "refund":
        return {
          label: t("cashRegister.types.refund"),
          isInput: false,
          chipStyle: { background: "rgba(245,158,11,0.08)", color: "var(--color-warning)", border: "1px solid rgba(245,158,11,0.15)" },
          icon: "keyboard_return",
        };
      case "expense":
        return {
          label: t("cashRegister.types.expense"),
          isInput: false,
          chipStyle: { background: "rgba(239,68,68,0.08)", color: "var(--color-error)", border: "1px solid rgba(239,68,68,0.15)" },
          icon: "receipt_long",
        };
      case "supplier_payment":
        return {
          label: t("cashRegister.types.supplier_payment"),
          isInput: false,
          chipStyle: { background: "rgba(180,83,9,0.08)", color: "var(--color-warning)", border: "1px solid rgba(180,83,9,0.15)" },
          icon: "local_shipping",
        };
      case "cash_out":
        return {
          label: t("cashRegister.types.cash_out"),
          isInput: false,
          chipStyle: { background: "rgba(239,68,68,0.08)", color: "var(--color-error)", border: "1px solid rgba(239,68,68,0.15)" },
          icon: "remove_circle",
        };
      default:
        return {
          label: type,
          isInput: true,
          chipStyle: { background: "rgba(107,114,128,0.08)", color: "var(--color-secondary)", border: "1px solid rgba(107,114,128,0.15)" },
          icon: "swap_horiz",
        };
    }
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
          {t("cashRegister.tabs.movements")}
        </p>
        {!isLoading && total > 0 && (
          <span
            style={{
              fontSize: "var(--text-label-sm)",
              color: "var(--color-secondary)",
              fontWeight: 500,
            }}
          >
            {total} {t("cashRegister.tabs.movements", { count: total })}
          </span>
        )}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: 800, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {[
                t("cashRegister.tables.user"),
                t("cashRegister.tables.date"),
                t("cashRegister.tables.type"),
                t("cashRegister.tables.amount"),
                t("cashRegister.tables.reason"),
              ].map((col, i) => (
                <th
                  key={i}
                  style={{
                    padding: "12px 24px",
                    textAlign: isRtl ? "right" : "left",
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
              : movements.length === 0
              ? <EmptyState />
              : movements.map((m) => {
                  const typeDetails = getMovementTypeDetails(m.type);
                  const isInput = typeDetails.isInput;
                  const userName = m.session?.user?.name ?? "—";

                  return (
                    <tr
                      key={m.id}
                      style={{ transition: "background 0.12s ease" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "rgba(212,175,55,0.04)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {/* Cashier / Session */}
                      <td style={{ padding: "14px 24px", borderBottom: "1px solid rgba(208,197,175,0.1)", textAlign: isRtl ? "right" : "left" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "var(--radius-full)",
                              background: "rgba(208,197,175,0.15)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 10,
                              fontWeight: 700,
                              color: "var(--color-secondary)",
                              flexShrink: 0,
                            }}
                          >
                            {initials(userName)}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: "var(--text-body-sm)", color: "var(--color-on-surface)" }}>
                              {userName}
                            </p>
                            <p style={{ fontSize: 9, color: "var(--color-secondary)" }}>
                              Session #{m.sessionId}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td style={{ padding: "14px 24px", borderBottom: "1px solid rgba(208,197,175,0.1)", color: "var(--color-secondary)", fontSize: "var(--text-body-sm)", textAlign: isRtl ? "right" : "left" }}>
                        {formatDate(m.createdAt)}
                      </td>

                      {/* Type Badge */}
                      <td style={{ padding: "14px 24px", borderBottom: "1px solid rgba(208,197,175,0.1)", textAlign: isRtl ? "right" : "left" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "4px 10px",
                            borderRadius: "var(--radius-full)",
                            fontSize: 11,
                            fontWeight: 600,
                            ...typeDetails.chipStyle,
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                            {typeDetails.icon}
                          </span>
                          {typeDetails.label}
                        </span>
                      </td>

                      {/* Amount */}
                      <td style={{ padding: "14px 24px", borderBottom: "1px solid rgba(208,197,175,0.1)", textAlign: isRtl ? "right" : "left" }}>
                        <span
                          style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 700,
                            fontSize: 14,
                            direction: "ltr",
                            color: isInput ? "var(--color-success)" : "var(--color-error)",
                          }}
                        >
                          {isInput ? "+" : "-"}
                          {formatCurrency(Math.abs(m.amount))}
                        </span>
                      </td>

                      {/* Reason / Notes */}
                      <td style={{ padding: "14px 24px", borderBottom: "1px solid rgba(208,197,175,0.1)", textAlign: isRtl ? "right" : "left" }}>
                        <div style={{ maxWidth: 350 }}>
                          <p style={{ fontWeight: 500, fontSize: "var(--text-body-sm)", color: "var(--color-on-surface)" }}>
                            {m.reason || "—"}
                          </p>
                          {m.notes && (
                            <p style={{ fontSize: 11, color: "var(--color-secondary)", marginTop: 2 }}>
                              {m.notes}
                            </p>
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
