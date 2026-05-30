import { formatCurrency } from "@/lib/utils";

interface DebtWidgetProps {
  totalDebt: number;
  debtorCount: number;
  recoveryRate: number;
  isLoading?: boolean;
}

function MiniStat({
  label,
  value,
  color,
  icon,
  isLoading,
}: {
  label: string;
  value: string;
  color: string;
  icon: string;
  isLoading?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        flex: 1,
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span
          className="material-symbols-outlined filled"
          style={{ fontSize: 14, color }}
        >
          {icon}
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            color: "var(--color-secondary)",
          }}
        >
          {label}
        </span>
      </div>
      {isLoading ? (
        <div
          className="skeleton"
          style={{ height: 22, width: "70%", borderRadius: "var(--radius-sm)" }}
        />
      ) : (
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 18,
            color,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          {value}
        </p>
      )}
    </div>
  );
}

export function DebtWidget({
  totalDebt,
  debtorCount,
  recoveryRate,
  isLoading,
}: DebtWidgetProps) {
  return (
    <div
      style={{
        background: "rgba(186,26,26,0.03)",
        border: "1px solid rgba(186,26,26,0.12)",
        borderRadius: "var(--radius-xl)",
        padding: "20px 24px",
        boxShadow: "var(--shadow-card)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          className="material-symbols-outlined filled"
          style={{ fontSize: 18, color: "var(--color-error)" }}
        >
          account_balance_wallet
        </span>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 14,
            color: "var(--color-on-surface)",
            letterSpacing: "-0.01em",
          }}
        >
          Créances clients
        </p>
      </div>

      {/* Recovery rate bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "var(--color-secondary)",
              fontWeight: 600,
            }}
          >
            Taux de recouvrement (mois)
          </span>
          {isLoading ? (
            <div
              className="skeleton"
              style={{ height: 14, width: 36, borderRadius: "var(--radius-sm)" }}
            />
          ) : (
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color:
                  recoveryRate >= 75
                    ? "var(--color-tertiary)"
                    : recoveryRate >= 40
                    ? "var(--color-warning)"
                    : "var(--color-error)",
              }}
            >
              {recoveryRate} %
            </span>
          )}
        </div>
        <div
          style={{
            height: 6,
            borderRadius: "var(--radius-full)",
            background: "rgba(208,197,175,0.2)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: isLoading ? "0%" : `${recoveryRate}%`,
              borderRadius: "var(--radius-full)",
              background:
                recoveryRate >= 75
                  ? "var(--color-tertiary)"
                  : recoveryRate >= 40
                  ? "var(--color-warning)"
                  : "var(--color-error)",
              transition: "width 0.6s ease",
            }}
          />
        </div>
      </div>

      {/* Mini stats */}
      <div
        style={{
          display: "flex",
          gap: 16,
          paddingTop: 4,
          borderTop: "1px solid rgba(208,197,175,0.12)",
        }}
      >
        <MiniStat
          label="Total dû"
          value={formatCurrency(totalDebt)}
          color="var(--color-error)"
          icon="payments"
          isLoading={isLoading}
        />
        <div
          style={{
            width: 1,
            background: "rgba(208,197,175,0.2)",
            alignSelf: "stretch",
          }}
        />
        <MiniStat
          label="Débiteurs"
          value={debtorCount.toLocaleString("fr-DZ")}
          color="var(--color-warning)"
          icon="group"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
