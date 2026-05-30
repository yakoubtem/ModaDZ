import { formatCurrency, initials } from "@/lib/utils";
import type { CustomerDebtSummary } from "@/types";

interface TopDebtorsWidgetProps {
  customers: CustomerDebtSummary[];
  isLoading: boolean;
  onViewDetail: (id: number) => void;
}

const RANK_COLORS = [
  "var(--color-error)",
  "var(--color-warning)",
  "var(--color-primary)",
];

export function TopDebtorsWidget({ customers, isLoading, onViewDetail }: TopDebtorsWidgetProps) {
  const top10 = [...customers]
    .filter((c) => c.currentDebt > 0)
    .sort((a, b) => b.currentDebt - a.currentDebt)
    .slice(0, 10);

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
      {/* Header */}
      <div
        style={{
          padding: "22px 24px 18px",
          borderBottom: "1px solid rgba(208,197,175,0.15)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "var(--radius-lg)",
            background: "rgba(186,26,26,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span
            className="material-symbols-outlined filled"
            style={{ fontSize: 19, color: "var(--color-error)" }}
          >
            warning
          </span>
        </div>
        <div>
          <p
            style={{
              fontWeight: 700,
              fontSize: "var(--text-body-sm)",
              color: "var(--color-on-surface)",
              marginBottom: 2,
            }}
          >
            Débiteurs prioritaires
          </p>
          <p style={{ fontSize: 11, color: "var(--color-secondary)" }}>
            Top 10 · Montant décroissant
          </p>
        </div>
      </div>

      {/* List */}
      <div>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                padding: "14px 24px",
                display: "flex",
                gap: 12,
                alignItems: "center",
                borderBottom: "1px solid rgba(208,197,175,0.08)",
              }}
            >
              <div className="skeleton" style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0 }} />
              <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 13, width: "65%", marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 11, width: "40%" }} />
              </div>
              <div className="skeleton" style={{ height: 15, width: 86 }} />
            </div>
          ))
        ) : top10.length === 0 ? (
          <div
            style={{
              padding: "48px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "var(--radius-xl)",
                background: "rgba(39,104,104,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 26, color: "var(--color-tertiary)" }}
              >
                check_circle
              </span>
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: "var(--text-body-sm)", color: "var(--color-on-surface)", marginBottom: 4 }}>
                Aucune dette en cours
              </p>
              <p style={{ fontSize: 12, color: "var(--color-secondary)", lineHeight: 1.5 }}>
                Tous vos clients sont à jour.
              </p>
            </div>
          </div>
        ) : (
          top10.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => onViewDetail(c.id)}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                borderBottom: "1px solid rgba(208,197,175,0.08)",
                padding: "14px 24px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
                transition: "background 0.12s ease",
                textAlign: "left",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "rgba(212,175,55,0.04)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "none")
              }
            >
              {/* Rank */}
              <span
                style={{
                  width: 22,
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                  color: RANK_COLORS[idx] ?? "var(--color-secondary)",
                  flexShrink: 0,
                }}
              >
                #{idx + 1}
              </span>

              {/* Avatar */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-full)",
                  background:
                    c.currentDebt > 50000
                      ? "rgba(186,26,26,0.1)"
                      : "rgba(180,83,9,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  color: c.currentDebt > 50000 ? "var(--color-error)" : "var(--color-warning)",
                  flexShrink: 0,
                }}
              >
                {initials(c.name)}
              </div>

              {/* Name + phone */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: "var(--color-on-surface)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    marginBottom: 2,
                  }}
                >
                  {c.name}
                </p>
                {c.phone && (
                  <p style={{ fontSize: 11, color: "var(--color-secondary)" }}>
                    {c.phone}
                  </p>
                )}
              </div>

              {/* Debt amount */}
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: "-0.01em",
                  color: c.currentDebt > 50000 ? "var(--color-error)" : "var(--color-warning)",
                  flexShrink: 0,
                }}
              >
                {formatCurrency(c.currentDebt)}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
