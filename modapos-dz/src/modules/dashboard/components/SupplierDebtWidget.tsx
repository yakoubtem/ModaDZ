import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { Skeleton } from "@/components/ui/Skeleton";
import { Landmark, TrendingUp } from "lucide-react";

interface SupplierDebtWidgetProps {
  totalSupplierDebt: number;
  debtorCount: number;
  topSupplierDebts: { id: number; name: string; currentDebt: number }[];
  upcomingPayments: {
    id: number;
    reference: string;
    supplierName: string;
    total: number;
    amountPaid: number;
    remaining: number;
    createdAt: string;
  }[];
  isLoading: boolean;
}

export function SupplierDebtWidget({
  totalSupplierDebt,
  debtorCount,
  topSupplierDebts = [],
  upcomingPayments = [],
  isLoading,
}: SupplierDebtWidgetProps) {
  const { t, isRtl } = useTranslation();
  const [activeTab, setActiveTab] = useState<"suppliers" | "upcoming">("suppliers");

  if (isLoading) {
    return (
      <div
        style={{
          background: "rgba(202, 138, 4, 0.02)",
          border: "1px solid rgba(202, 138, 4, 0.1)",
          borderRadius: "var(--radius-xl)",
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-14 w-full" />
        <div style={{ display: "flex", gap: 12 }}>
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "rgba(202, 138, 4, 0.03)", // Warning / Gold tint for supplier liability
        border: "1px solid rgba(202, 138, 4, 0.12)",
        borderRadius: "var(--radius-xl)",
        padding: "20px 24px",
        boxShadow: "var(--shadow-card)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        textAlign: isRtl ? "right" : "left",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: isRtl ? "row-reverse" : "row",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <Landmark className="w-5 h-5" style={{ color: "var(--color-warning)" }} />
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 14,
              color: "var(--color-on-surface)",
              letterSpacing: "-0.01em",
            }}
          >
            {t("dashboard.supplier_debt_widget.title")}
          </p>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            background: "rgba(202, 138, 4, 0.1)",
            color: "var(--color-warning)",
            padding: "2px 8px",
            borderRadius: "var(--radius-full)",
          }}
        >
          {debtorCount} {t("dashboard.supplier_debt_widget.suppliers")}
        </span>
      </div>

      {/* KPI Stats block */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          background: "var(--color-surface)",
          border: "1px solid rgba(208, 197, 175, 0.2)",
          borderRadius: 12,
          flexDirection: isRtl ? "row-reverse" : "row",
        }}
      >
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-secondary)", marginBottom: 4 }}>
            {t("dashboard.supplier_debt_widget.total_due")}
          </p>
          <p
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "var(--color-on-surface)",
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.02em",
              direction: "ltr",
              textAlign: isRtl ? "right" : "left",
            }}
          >
            {formatCurrency(totalSupplierDebt)}
          </p>
        </div>
        <TrendingUp className="w-6 h-6" style={{ color: "var(--color-warning)", opacity: 0.8 }} />
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          background: "rgba(208, 197, 175, 0.1)",
          padding: 3,
          borderRadius: 8,
          gap: 4,
          flexDirection: isRtl ? "row-reverse" : "row",
        }}
      >
        <button
          onClick={() => setActiveTab("suppliers")}
          style={{
            flex: 1,
            padding: "6px 12px",
            borderRadius: 6,
            border: "none",
            background: activeTab === "suppliers" ? "var(--color-surface)" : "transparent",
            color: activeTab === "suppliers" ? "var(--color-on-surface)" : "var(--color-secondary)",
            fontSize: 12,
            fontWeight: activeTab === "suppliers" ? 600 : 500,
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: activeTab === "suppliers" ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
          }}
        >
          {t("dashboard.supplier_debt_widget.top_suppliers")}
        </button>
        <button
          onClick={() => setActiveTab("upcoming")}
          style={{
            flex: 1,
            padding: "6px 12px",
            borderRadius: 6,
            border: "none",
            background: activeTab === "upcoming" ? "var(--color-surface)" : "transparent",
            color: activeTab === "upcoming" ? "var(--color-on-surface)" : "var(--color-secondary)",
            fontSize: 12,
            fontWeight: activeTab === "upcoming" ? 600 : 500,
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: activeTab === "upcoming" ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
          }}
        >
          {t("dashboard.supplier_debt_widget.upcoming_payments")}
        </button>
      </div>

      {/* List content */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 240, overflowY: "auto" }} className="no-scrollbar">
        {activeTab === "suppliers" ? (
          topSupplierDebts.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--color-outline)", textAlign: "center", padding: "24px 0", fontStyle: "italic" }}>
              {t("dashboard.supplier_debt_widget.no_debts")}
            </p>
          ) : (
            topSupplierDebts.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: "var(--color-surface)",
                  borderRadius: 8,
                  border: "1px solid rgba(208, 197, 175, 0.15)",
                  flexDirection: isRtl ? "row-reverse" : "row",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-outline)" }}>
                    #{idx + 1}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-on-surface)" }}>
                    {item.name}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--color-warning)",
                    fontVariantNumeric: "tabular-nums",
                    direction: "ltr",
                  }}
                >
                  {formatCurrency(item.currentDebt)}
                </span>
              </div>
            ))
          )
        ) : (
          upcomingPayments.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--color-outline)", textAlign: "center", padding: "24px 0", fontStyle: "italic" }}>
              {t("dashboard.supplier_debt_widget.no_upcoming")}
            </p>
          ) : (
            upcomingPayments.map((p) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px 12px",
                  background: "var(--color-surface)",
                  borderRadius: 8,
                  border: "1px solid rgba(208, 197, 175, 0.15)",
                  gap: 4,
                  textAlign: isRtl ? "right" : "left",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexDirection: isRtl ? "row-reverse" : "row",
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-on-surface)" }}>
                    {p.supplierName}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--color-error)",
                      fontVariantNumeric: "tabular-nums",
                      direction: "ltr",
                    }}
                  >
                    {formatCurrency(p.remaining)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    color: "var(--color-outline)",
                    flexDirection: isRtl ? "row-reverse" : "row",
                  }}
                >
                  <span>
                    {t("dashboard.supplier_debt_widget.reference")}: {p.reference || `#${p.id}`}
                  </span>
                  <span>
                    {new Date(p.createdAt).toLocaleDateString(isRtl ? "ar-DZ" : "fr-DZ", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
