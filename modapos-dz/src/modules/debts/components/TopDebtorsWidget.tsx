import { formatCurrency, initials } from "@/lib/utils";
import type { CustomerDebtSummary } from "@/types";

interface TopDebtorsWidgetProps {
  customers: CustomerDebtSummary[];
  isLoading: boolean;
  onViewDetail: (id: number) => void;
}

export function TopDebtorsWidget({ customers, isLoading, onViewDetail }: TopDebtorsWidgetProps) {
  const top10 = [...customers]
    .filter((c) => c.currentDebt > 0)
    .sort((a, b) => b.currentDebt - a.currentDebt)
    .slice(0, 10);

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
      {/* Header */}
      <div
        style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid rgba(208,197,175,0.2)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "var(--radius-full)",
            background: "rgba(186,26,26,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span className="material-symbols-outlined filled" style={{ fontSize: 18, color: "var(--color-error)" }}>
            warning
          </span>
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: "var(--text-body-sm)", color: "var(--color-on-surface)" }}>
            Clients avec dette élevée
          </p>
          <p style={{ fontSize: 11, color: "var(--color-secondary)" }}>
            Top 10 par montant dû
          </p>
        </div>
      </div>

      {/* List */}
      <div style={{ padding: "8px 0" }}>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ padding: "12px 24px", display: "flex", gap: 12, alignItems: "center" }}>
              <div className="skeleton" style={{ width: 32, height: 32, borderRadius: "50%" }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 14, width: "60%", marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 12, width: "40%" }} />
              </div>
              <div className="skeleton" style={{ height: 16, width: 80 }} />
            </div>
          ))
        ) : top10.length === 0 ? (
          <div style={{ padding: "32px 24px", textAlign: "center", color: "var(--color-secondary)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 32, display: "block", marginBottom: 8, opacity: 0.4 }}>
              check_circle
            </span>
            <p style={{ fontSize: "var(--text-body-sm)" }}>Aucune dette élevée</p>
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
                padding: "12px 24px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
                transition: "background 0.15s ease",
                textAlign: "left",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.9)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "none")
              }
            >
              {/* Rank */}
              <span
                style={{
                  width: 20,
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: idx === 0 ? "var(--color-error)" : idx === 1 ? "var(--color-warning)" : "var(--color-secondary)",
                  flexShrink: 0,
                }}
              >
                {idx + 1}
              </span>

              {/* Avatar */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-full)",
                  background:
                    c.currentDebt > 50000
                      ? "rgba(186,26,26,0.12)"
                      : "rgba(180,83,9,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
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
                    fontSize: "var(--text-body-sm)",
                    color: "var(--color-on-surface)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
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
