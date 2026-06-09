import { formatCurrency } from "@/lib/utils";
import type { SupplierDebtStatistics } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

interface KPICardProps {
  icon: string;
  label: string;
  value: string;
  iconColor?: string;
  iconBg?: string;
  isLoading?: boolean;
  accent?: boolean;
}

function KPICard({ icon, label, value, iconColor, iconBg, isLoading, accent }: KPICardProps) {
  const { isRtl } = useTranslation();
  return (
    <div
      style={{
        background: accent ? "rgba(186,26,26,0.04)" : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: accent
          ? "1px solid rgba(186,26,26,0.15)"
          : "1px solid rgba(208,197,175,0.3)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-card)",
        padding: "28px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        minHeight: 148,
        textAlign: isRtl ? "right" : "left",
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
          alignSelf: isRtl ? "flex-end" : "flex-start",
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
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
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
                color: iconColor ?? "var(--color-on-surface)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                direction: "ltr",
                textAlign: isRtl ? "right" : "left",
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
                textTransform: "uppercase",
              }}
            >
              {label}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

interface SupplierDebtKPICardsProps {
  stats: SupplierDebtStatistics | null;
  isLoading: boolean;
}

export function SupplierDebtKPICards({ stats, isLoading }: SupplierDebtKPICardsProps) {
  const { t, language } = useTranslation();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 20,
        marginBottom: 32,
      }}
    >
      <KPICard
        icon="account_balance_wallet"
        label={t("supplierDebts.kpis.total_debt")}
        value={stats ? formatCurrency(stats.totalDebt) : "—"}
        iconBg="rgba(186,26,26,0.1)"
        iconColor="var(--color-error)"
        isLoading={isLoading}
        accent
      />
      <KPICard
        icon="local_shipping"
        label={t("supplierDebts.kpis.debtor_count")}
        value={stats ? stats.debtorCount.toLocaleString(language === "ar" ? "ar-DZ" : "fr-DZ") : "—"}
        iconBg="rgba(212,175,55,0.15)"
        iconColor="var(--color-primary)"
        isLoading={isLoading}
      />
      <KPICard
        icon="payments"
        label={t("supplierDebts.kpis.paid_month")}
        value={stats ? formatCurrency(stats.paidThisMonth) : "—"}
        iconBg="rgba(39,104,104,0.12)"
        iconColor="var(--color-tertiary)"
        isLoading={isLoading}
      />
      <KPICard
        icon="avg"
        label={t("supplierDebts.kpis.avg_debt")}
        value={stats ? formatCurrency(stats.avgDebtPerDebtor) : "—"}
        iconBg="rgba(180,83,9,0.1)"
        iconColor="var(--color-warning)"
        isLoading={isLoading}
      />
    </div>
  );
}
