import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface PurchaseKPICardsProps {
  summary?: {
    totalPurchasesAmount: number;
    totalDebts: number;
    monthPurchasesAmount: number;
    avgPurchaseAmount: number;
  };
  isLoading: boolean;
}

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
    <div
      style={{
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(208, 197, 175, 0.3)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-card)",
        padding: "24px",
        display: "flex",
        flexDirection: "column" as const,
        gap: 16,
        minHeight: 130,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "var(--radius-lg)",
          background: iconBg ?? "rgba(212, 175, 55, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 22, color: iconColor ?? "var(--color-primary)" }}
        >
          {icon}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column" as const, gap: 4 }}>
        {isLoading ? (
          <div className="skeleton" style={{ height: 28, width: "70%", borderRadius: "var(--radius-md)" }} />
        ) : (
          <>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 24,
                fontWeight: 700,
                color: "var(--color-on-surface)",
                lineHeight: 1.1,
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
          </>
        )}
      </div>
    </div>
  );
}

export function PurchaseKPICards({ summary, isLoading }: PurchaseKPICardsProps) {
  const { t } = useTranslation();

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
        icon="shopping_cart"
        label={t("purchases.kpis.total_purchases_amount")}
        value={summary ? formatCurrency(summary.totalPurchasesAmount) : "—"}
        iconBg="rgba(212, 175, 55, 0.15)"
        iconColor="var(--color-primary)"
        isLoading={isLoading}
      />
      <KPICard
        icon="payments"
        label={t("purchases.kpis.total_debts")}
        value={summary ? formatCurrency(summary.totalDebts) : "—"}
        iconBg="rgba(186, 26, 26, 0.1)"
        iconColor="var(--color-error)"
        isLoading={isLoading}
      />
      <KPICard
        icon="calendar_month"
        label={t("purchases.kpis.month_purchases_amount")}
        value={summary ? formatCurrency(summary.monthPurchasesAmount) : "—"}
        iconBg="rgba(39, 104, 104, 0.12)"
        iconColor="var(--color-tertiary)"
        isLoading={isLoading}
      />
      <KPICard
        icon="analytics"
        label={t("purchases.kpis.avg_purchase_amount")}
        value={summary ? formatCurrency(summary.avgPurchaseAmount) : "—"}
        iconBg="rgba(2, 132, 199, 0.12)"
        iconColor="var(--color-info)"
        isLoading={isLoading}
      />
    </div>
  );
}
