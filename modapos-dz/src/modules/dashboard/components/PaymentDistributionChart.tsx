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
  cash: "var(--color-success)",
  card: "var(--color-accent)",
  transfer: "var(--color-warning)",
};

const LABELS: Record<string, string> = {
  cash: "Espèces",
  card: "Carte",
  transfer: "Virement",
};

export function PaymentDistributionChart({ data, isLoading }: PaymentDistributionChartProps) {
  if (isLoading || !data) {
    return (
      <div className="bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] h-[400px] flex flex-col gap-6 shadow-[var(--shadow-sm)]">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="flex-1 w-full rounded-full" />
      </div>
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
    <div className="bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] h-[400px] flex flex-col shadow-[var(--shadow-sm)] transition-shadow duration-200 hover:shadow-[var(--shadow-md)]">
      <h3 className="text-[14px] font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
        Répartition des paiements
      </h3>
      <div className="flex-1 min-h-0 relative">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
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
                  backgroundColor: "#ffffff",
                  borderColor: "var(--color-border)",
                  borderRadius: "10px",
                  color: "var(--color-text-primary)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
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
          <div className="absolute inset-0 flex items-center justify-center text-[var(--color-text-muted)] text-sm italic">
            Aucun paiement enregistré
          </div>
        )}
      </div>
    </div>
  );
}