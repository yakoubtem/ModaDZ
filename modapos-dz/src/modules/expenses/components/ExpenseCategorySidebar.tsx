import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import type { Expense } from "@/types";

interface ExpenseCategorySidebarProps {
  expenses: Expense[];
  isLoading: boolean;
  onManageCategories?: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  Loyer: "home",
  Salaires: "group",
  Transport: "local_shipping",
  Marketing: "campaign",
  Internet: "wifi",
  "Électricité": "bolt",
  Eau: "water_drop",
  Maintenance: "build",
  Achats: "shopping_bag",
  Fournisseurs: "store",
  Taxes: "receipt_long",
  Autres: "more_horiz",
};

export function ExpenseCategorySidebar({ expenses, isLoading, onManageCategories }: ExpenseCategorySidebarProps) {
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    let totalAmount = 0;

    for (const exp of expenses) {
      map.set(exp.category, (map.get(exp.category) ?? 0) + exp.amount);
      totalAmount += exp.amount;
    }

    return Array.from(map.entries())
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0,
        icon: CATEGORY_ICONS[name] ?? "label",
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);
  }, [expenses]);

  if (isLoading) {
    return (
      <div
        className="glass-card"
        style={{
          borderRadius: "var(--radius-xl)",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div className="skeleton" style={{ height: 16, width: "70%", borderRadius: 6 }} />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 44, borderRadius: 8 }} />
        ))}
      </div>
    );
  }

  return (
    <div
      className="glass-card"
      style={{
        borderRadius: "var(--radius-xl)",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <h3
        style={{
          fontSize: "var(--text-label-md)",
          fontWeight: "var(--fw-label-md)",
          letterSpacing: "var(--ls-label-md)",
          color: "var(--color-secondary)",
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--color-primary-container)",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        Top catégories
      </h3>

      {categories.length === 0 ? (
        <p
          style={{
            fontSize: "var(--text-body-sm)",
            color: "var(--color-secondary)",
            fontStyle: "italic",
            textAlign: "center",
            padding: "24px 0",
          }}
        >
          Aucune dépense
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {categories.map((cat) => (
            <div
              key={cat.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                borderRadius: "var(--radius-lg)",
                background: "var(--color-surface-container-low)",
                transition: "background 0.15s ease",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "var(--radius-md)",
                  background: "rgba(212,175,55,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18, color: "var(--color-primary)" }}
                >
                  {cat.icon}
                </span>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--text-body-sm)",
                      fontWeight: 600,
                      color: "var(--color-on-surface)",
                    }}
                  >
                    {cat.name}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--color-primary)",
                      flexShrink: 0,
                      marginLeft: 8,
                    }}
                  >
                    {cat.percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    height: 4,
                    borderRadius: "var(--radius-full)",
                    background: "rgba(208,197,175,0.25)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${cat.percentage}%`,
                      borderRadius: "var(--radius-full)",
                      background: "var(--color-primary-container)",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>

                <span
                  style={{
                    fontSize: 11,
                    color: "var(--color-secondary)",
                    marginTop: 4,
                    display: "block",
                  }}
                >
                  {formatCurrency(cat.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {onManageCategories && (
        <button
          onClick={onManageCategories}
          className="btn-border"
          style={{ width: "100%", marginTop: 16, justifyContent: "center", gap: 6 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>settings</span>
          Gérer les catégories
        </button>
      )}
    </div>
  );
}
