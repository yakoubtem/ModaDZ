import { formatCurrency } from "@/lib/utils";
import type { CashRegisterStatistics } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

interface KPICardProps {
  icon: string;
  label: string;
  value: string;
  iconColor?: string;
  iconBg?: string;
  isLoading?: boolean;
  accent?: boolean;
  valueColor?: string;
}

function KPICard({
  icon,
  label,
  value,
  iconColor,
  iconBg,
  isLoading,
  accent,
  valueColor,
}: KPICardProps) {
  const { isRtl } = useTranslation();
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
              style={{
                height: 32,
                width: "75%",
                borderRadius: "var(--radius-md)",
                marginBottom: 6,
              }}
            />
            <div
              className="skeleton"
              style={{ height: 13, width: "50%", borderRadius: "var(--radius-sm)" }}
            />
          </>
        ) : (
          <>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 28,
                fontWeight: 700,
                color: valueColor ?? iconColor ?? "var(--color-on-surface)",
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

interface CashKPICardsProps {
  stats: CashRegisterStatistics | null;
  isLoading: boolean;
}

export function CashKPICards({ stats, isLoading }: CashKPICardsProps) {
  const { t, language } = useTranslation();

  const formattedDifference = () => {
    if (!stats) return "—";
    const diff = stats.cashDifference;
    if (diff > 0) return `+${formatCurrency(diff)}`;
    return formatCurrency(diff);
  };

  const getDifferenceColor = () => {
    if (!stats) return "var(--color-on-surface)";
    const diff = stats.cashDifference;
    if (diff === 0) return "var(--color-success)";
    if (Math.abs(diff) <= 1000) return "var(--color-warning)";
    return "var(--color-error)";
  };

  const getDifferenceBg = () => {
    if (!stats) return "rgba(212,175,55,0.15)";
    const diff = stats.cashDifference;
    if (diff === 0) return "rgba(16,185,129,0.1)";
    if (Math.abs(diff) <= 1000) return "rgba(245,158,11,0.1)";
    return "rgba(239,68,68,0.1)";
  };

  const getDifferenceIconColor = () => {
    if (!stats) return "var(--color-primary)";
    const diff = stats.cashDifference;
    if (diff === 0) return "var(--color-success)";
    if (Math.abs(diff) <= 1000) return "var(--color-warning)";
    return "var(--color-error)";
  };

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
        icon="payments"
        label={t("cashRegister.kpis.cash_today")}
        value={stats ? formatCurrency(stats.cashToday) : "—"}
        iconBg="rgba(39,104,104,0.12)"
        iconColor="var(--color-tertiary)"
        isLoading={isLoading}
        accent
      />
      <KPICard
        icon="sync_alt"
        label={t("cashRegister.kpis.cash_movements")}
        value={stats ? stats.cashMovementsCount.toLocaleString(language === "ar" ? "ar-DZ" : "fr-DZ") : "—"}
        iconBg="rgba(212,175,55,0.15)"
        iconColor="var(--color-primary)"
        isLoading={isLoading}
      />
      <KPICard
        icon="point_of_sale"
        label={t("cashRegister.kpis.open_sessions")}
        value={stats ? stats.openSessionsCount.toLocaleString(language === "ar" ? "ar-DZ" : "fr-DZ") : "—"}
        iconBg="rgba(99,102,241,0.12)"
        iconColor="#6366f1"
        isLoading={isLoading}
      />
      <KPICard
        icon="balance"
        label={t("cashRegister.kpis.cash_difference")}
        value={formattedDifference()}
        iconBg={getDifferenceBg()}
        iconColor={getDifferenceIconColor()}
        valueColor={getDifferenceColor()}
        isLoading={isLoading}
      />
    </div>
  );
}
