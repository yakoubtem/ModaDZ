import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { PaymentDataPoint } from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";

interface PaymentDistributionChartProps {
  data?: PaymentDataPoint[];
  isLoading: boolean;
}

const COLORS = {
  cash: "var(--color-tertiary)",
  card: "var(--color-primary)",
  transfer: "var(--color-secondary)",
};

const LABELS: Record<string, string> = {
  cash: "Espèces",
  card: "Carte",
  transfer: "Virement",
};

export function PaymentDistributionChart({ data, isLoading }: PaymentDistributionChartProps) {
  if (isLoading || !data) {
    return (
      <>
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="flex-1 w-full rounded-full" />
      </>
    );
  }

  // Format data for chart
  const formattedData = data.map((d) => ({
    name: LABELS[d.name] || d.name,
    value: d.value,
    color: COLORS[d.name as keyof typeof COLORS] || "var(--color-text-muted)",
  }));

  const hasData = formattedData.reduce((acc, d) => acc + d.value, 0) > 0;

  return (
    <>
      <h3
        style={{
          fontSize: "var(--text-label-md)",
          fontWeight: "var(--fw-label-md)",
          letterSpacing: "var(--ls-label-md)",
          color: "var(--color-secondary)",
          marginBottom: 16,
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
            background: "var(--color-primary)",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        Répartition des paiements
      </h3>
      <div style={{ minWidth: 0, width: "100%", height: 220, position: "relative" }}>
        {hasData ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-surface-container-lowest)",
                  borderColor: "var(--color-border)",
                  borderRadius: "10px",
                  color: "var(--color-on-surface)",
                  boxShadow: "var(--shadow-card)",
                  fontSize: "12px",
                }}
                formatter={(value: unknown) => {
                  const n = typeof value === "number" ? value : Number(value ?? 0);
                  return [`${n} transaction(s)`, "Paiements"];
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ paddingTop: 6 }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-secondary)", fontSize: 14, fontStyle: "italic" }}>
            Aucun paiement enregistré
          </div>
        )}
      </div>
    </>
  );
}