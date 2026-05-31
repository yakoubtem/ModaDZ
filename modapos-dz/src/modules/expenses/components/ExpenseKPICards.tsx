import { formatCurrency } from "@/lib/utils";
import type { ExpenseSummary } from "@/types";

interface KPICardProps {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  iconColor?: string;
  iconBg?: string;
  isLoading?: boolean;
  accent?: boolean;
}

function KPICard({ icon, label, value, sub, iconColor, iconBg, isLoading, accent }: KPICardProps) {
  return (
    <div
      style={{
        background: accent ? "rgba(39,104,104,0.04)" : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: accent
          ? "1px solid rgba(39,104,104,0.15)"
          : "1px solid rgba(208,197,175,0.3)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-card)",
        padding: "28px",
        display: "flex",
        flexDirection: "column" as const,
        gap: 20,
        minHeight: 148,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "var(--radius-lg)",
          background: iconBg ?? "rgba(212,175,55,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          className="material-symbols-outlined filled"
          style={{ fontSize: 22, color: iconColor ?? "var(--color-primary)" }}
        >
          {icon}
        </span>
      </div>

      {/* Value + Label */}
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 4 }}>
        {isLoading ? (
          <>
            <div
              className="skeleton"
              style={{ height: 32, width: "75%", borderRadius: "var(--radius-md)", marginBottom: 6 }}
            />
            <div className="skeleton" style={{ height: 13, width: "50%", borderRadius: "var(--radius-sm)" }} />
          </>
        ) : (
          <>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 28,
                fontWeight: 700,
                color: "var(--color-on-surface)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {value}
            </p>
            <p
              style={{
                fontSize: "var(--text-label-sm)",
                letterSpacing: "var(--ls-label-sm)",
                fontWeight: "var(--fw-label-sm)",
                color: "var(--color-secondary)",
                textTransform: "uppercase" as const,
              }}
            >
              {label}
            </p>
            {sub && (
              <p style={{ fontSize: 12, color: "var(--color-secondary)", marginTop: 2 }}>
                {sub}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface ExpenseKPICardsProps {
  summary: ExpenseSummary | null;
  isLoading: boolean;
}

export function ExpenseKPICards({ summary, isLoading }: ExpenseKPICardsProps) {
  const netProfit = summary ? summary.totalSalesMonth - summary.monthTotal : 0;
  const isPositive = netProfit >= 0;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 20,
        marginBottom: 32,
      }}
    >
      <KPICard
        icon="payments"
        label="Total dépenses du mois"
        value={summary ? formatCurrency(summary.monthTotal) : "—"}
        iconBg="rgba(186,26,26,0.1)"
        iconColor="var(--color-error)"
        isLoading={isLoading}
      />
      <KPICard
        icon="today"
        label="Total dépenses aujourd'hui"
        value={summary ? formatCurrency(summary.todayTotal) : "—"}
        iconBg="rgba(212,175,55,0.15)"
        iconColor="var(--color-primary)"
        isLoading={isLoading}
      />
      <KPICard
        icon="category"
        label="Catégorie principale"
        value={summary?.topCategory?.name ?? "—"}
        sub={summary?.topCategory ? formatCurrency(summary.topCategory.amount) : undefined}
        iconBg="rgba(180,83,9,0.1)"
        iconColor="var(--color-warning)"
        isLoading={isLoading}
      />
      <KPICard
        icon="trending_up"
        label="Profit net estimé"
        value={summary ? formatCurrency(netProfit) : "—"}
        sub={summary ? `Ventes: ${formatCurrency(summary.totalSalesMonth)}` : undefined}
        iconBg={isPositive ? "rgba(39,104,104,0.12)" : "rgba(186,26,26,0.1)"}
        iconColor={isPositive ? "var(--color-tertiary)" : "var(--color-error)"}
        isLoading={isLoading}
        accent
      />
    </div>
  );
}
