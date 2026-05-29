import { formatCurrency, formatDate, initials } from "@/lib/utils";
import type { CustomerDebtSummary } from "@/types";

// ─── Debt Status Badge ──────────────────────────────────────

function debtStatus(debt: number): {
  label: string;
  chipClass: string;
  dotColor: string;
} {
  if (debt <= 0)
    return { label: "Soldé", chipClass: "chip chip-success", dotColor: "var(--color-tertiary)" };
  if (debt < 5000)
    return { label: "Faible", chipClass: "chip chip-success", dotColor: "var(--color-tertiary)" };
  if (debt < 50000)
    return { label: "Moyenne", chipClass: "chip", dotColor: "var(--color-warning)", chipBg: "rgba(180,83,9,0.1)", chipColor: "var(--color-warning)" } as ReturnType<typeof debtStatus>;
  return { label: "Élevée", chipClass: "chip chip-error", dotColor: "var(--color-error)" };
}

// ─── Skeleton Row ───────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} style={{ padding: "20px 24px" }}>
          <div className="skeleton" style={{ height: 16, borderRadius: 4, width: i === 0 ? 140 : i === 7 ? 80 : 100 }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Main Component ──────────────────────────────────────────

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
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(208,197,175,0.3)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-soft)",
        overflow: "hidden",
      }}
    >
      <div className="table-container" style={{ overflowX: "auto" }}>
        <table className="table-base" style={{ minWidth: 900 }}>
          <thead>
            <tr>
              {["Client", "Téléphone", "Total achats", "Total payé", "Dette actuelle", "Dernier achat", "Statut", "Actions"].map(
                (col) => (
                  <th key={col}>{col}</th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              : customers.length === 0
              ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "48px 24px", color: "var(--color-secondary)" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 40, display: "block", marginBottom: 8, opacity: 0.4 }}>
                      account_balance_wallet
                    </span>
                    Aucun client trouvé
                  </td>
                </tr>
              )
              : customers.map((c) => {
                  const status = debtStatus(c.currentDebt);
                  return (
                    <tr
                      key={c.id}
                      onClick={() => onViewDetail(c.id)}
                      style={{ cursor: "pointer" }}
                    >
                      {/* Client */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: "var(--radius-full)",
                              background:
                                c.currentDebt > 50000
                                  ? "rgba(186,26,26,0.12)"
                                  : c.currentDebt > 5000
                                  ? "rgba(180,83,9,0.1)"
                                  : "rgba(212,175,55,0.15)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
                              fontWeight: 700,
                              color:
                                c.currentDebt > 50000
                                  ? "var(--color-error)"
                                  : c.currentDebt > 5000
                                  ? "var(--color-warning)"
                                  : "var(--color-primary)",
                              flexShrink: 0,
                            }}
                          >
                            {initials(c.name)}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: "var(--text-body-sm)" }}>
                              {c.name}
                            </p>
                            <p style={{ fontSize: 11, color: "var(--color-secondary)" }}>
                              {c.salesCount} vente{c.salesCount !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td style={{ color: "var(--color-secondary)", fontSize: "var(--text-body-sm)" }}>
                        {c.phone ?? "—"}
                      </td>

                      {/* Total purchases */}
                      <td style={{ fontWeight: 600 }}>{formatCurrency(c.totalPurchases)}</td>

                      {/* Total paid */}
                      <td style={{ color: "var(--color-tertiary)", fontWeight: 600 }}>
                        {formatCurrency(c.totalPaid)}
                      </td>

                      {/* Current debt */}
                      <td>
                        <span
                          style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 700,
                            fontSize: "var(--text-body-md)",
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
                      <td style={{ color: "var(--color-secondary)", fontSize: "var(--text-body-sm)" }}>
                        {c.lastPurchaseDate ? formatDate(c.lastPurchaseDate) : "—"}
                      </td>

                      {/* Status badge */}
                      <td>
                        <span
                          className={status.chipClass}
                          style={
                            status.label === "Moyenne"
                              ? { background: "rgba(180,83,9,0.1)", color: "var(--color-warning)" }
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
                              marginRight: 4,
                            }}
                          />
                          {status.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn-border"
                          style={{ padding: "6px 14px", fontSize: 12 }}
                          onClick={() => onViewDetail(c.id)}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                            visibility
                          </span>
                          Voir
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
            padding: "16px 24px",
            borderTop: "1px solid rgba(208,197,175,0.2)",
          }}
        >
          <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)" }}>
            {total} client{total !== 1 ? "s" : ""} au total
          </p>
          <div style={{ display: "flex", gap: 4 }}>
            <button
              className="page-btn"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              style={{ opacity: page <= 1 ? 0.4 : 1 }}
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
              style={{ opacity: page >= totalPages ? 0.4 : 1 }}
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
