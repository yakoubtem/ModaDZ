import { formatCurrency } from "@/lib/utils";
import type { DebtStatistics } from "@/types";

interface KPICardProps {
  icon: string;
  label: string;
  value: string;
  iconColor?: string;
  iconBg?: string;
  isLoading?: boolean;
}

function KPICard({ icon, label, value, iconColor, iconBg, isLoading }: KPICardProps) {
  return (
    <div className="kpi-card" style={{ minHeight: 120 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div
          className="kpi-icon"
          style={{
            background: iconBg ?? "rgba(212,175,55,0.15)",
            color: iconColor ?? "var(--color-primary)",
          }}
        >
          <span className="material-symbols-outlined filled" style={{ fontSize: 20 }}>
            {icon}
          </span>
        </div>
      </div>
      <div>
        <p
          style={{
            fontSize: "var(--text-label-sm)",
            letterSpacing: "var(--ls-label-sm)",
            color: "var(--color-secondary)",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          {label}
        </p>
        {isLoading ? (
          <div
            className="skeleton"
            style={{ height: 36, width: "70%", borderRadius: "var(--radius-md)" }}
          />
        ) : (
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-headline-md)",
              fontWeight: "var(--fw-headline-lg)",
              color: "var(--color-on-surface)",
              lineHeight: 1.2,
            }}
          >
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

interface DebtKPICardsProps {
  stats: DebtStatistics | null;
  isLoading: boolean;
}

export function DebtKPICards({ stats, isLoading }: DebtKPICardsProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "var(--space-card-gap)",
        marginBottom: "var(--space-card-gap)",
      }}
    >
      <KPICard
        icon="account_balance_wallet"
        label="Montant total dû"
        value={stats ? formatCurrency(stats.totalDebt) : "—"}
        iconBg="rgba(186,26,26,0.1)"
        iconColor="var(--color-error)"
        isLoading={isLoading}
      />
      <KPICard
        icon="group"
        label="Clients débiteurs"
        value={stats ? stats.debtorCount.toLocaleString("fr-DZ") : "—"}
        iconBg="rgba(212,175,55,0.15)"
        iconColor="var(--color-primary)"
        isLoading={isLoading}
      />
      <KPICard
        icon="payments"
        label="Récupéré ce mois"
        value={stats ? formatCurrency(stats.recoveredThisMonth) : "—"}
        iconBg="rgba(39,104,104,0.12)"
        iconColor="var(--color-tertiary)"
        isLoading={isLoading}
      />
      <KPICard
        icon="trending_down"
        label="Dette moyenne / client"
        value={stats ? formatCurrency(stats.avgDebtPerDebtor) : "—"}
        iconBg="rgba(180,83,9,0.1)"
        iconColor="var(--color-warning)"
        isLoading={isLoading}
      />
    </div>
  );
}
