import { formatCurrency } from "@/lib/utils";
import type { TopProduct } from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopProductsListProps {
  products?: TopProduct[];
  isLoading: boolean;
}

const rankColors = [
  { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200/50" },
  { bg: "bg-slate-50",  text: "text-slate-500",  border: "border-slate-200/50" },
  { bg: "bg-orange-50", text: "text-orange-500", border: "border-orange-200/50" },
];

export function TopProductsList({ products, isLoading }: TopProductsListProps) {
  if (isLoading || !products) {
    return (
      <>
        <Skeleton className="h-5 w-48 mb-4" />
        <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <h3
          style={{
            fontSize: "var(--text-label-md)",
            fontWeight: "var(--fw-label-md)",
            letterSpacing: "var(--ls-label-md)",
            color: "var(--color-secondary)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Trophy className="w-4 h-4" style={{ color: "#f59e0b" }} />
          Meilleures ventes (30j)
        </h3>
        <p
          style={{
            fontSize: 12,
            color: "var(--color-outline)",
            marginTop: 4,
            marginLeft: 24,
          }}
        >
          Articles générant le plus de revenus
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 20, flex: 1, overflowY: "auto", paddingRight: 4 }}>
        {products.length === 0 ? (
          <p style={{ color: "var(--color-outline)", fontSize: 14, padding: "32px 0", textAlign: "center", fontStyle: "italic" }}>
            Aucune vente enregistrée
          </p>
        ) : (
          products.map((product, idx) => {
            const rankBg = idx === 0 ? "#fffbeb" : idx === 1 ? "#f8fafc" : idx === 2 ? "#fff7ed" : "var(--color-surface-container)";
            const rankText = idx === 0 ? "#d97706" : idx === 1 ? "#64748b" : idx === 2 ? "#f97316" : "var(--color-outline)";
            return (
              <div
                key={product.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "8px 10px",
                  borderRadius: 12,
                  border: "1px solid transparent",
                  cursor: "default",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--color-surface-container-low)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >
                {/* Rank badge */}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: rankBg,
                    color: rankText,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 12,
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </div>

                {/* Product info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {product.name}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--color-outline)", marginTop: 2 }}>
                    {product.size && product.color
                      ? `${product.size} / ${product.color}`
                      : `Variante #${product.id}`}
                  </p>
                </div>

                {/* Stats */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--color-on-surface)", fontVariantNumeric: "tabular-nums" }}>
                    {formatCurrency(product.revenueGenerated)}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--color-primary)", fontWeight: 600, marginTop: 2 }}>
                    {product.quantitySold} vendus
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}