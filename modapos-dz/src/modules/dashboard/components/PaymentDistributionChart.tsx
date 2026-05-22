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
      <div className="bg-[var(--color-bg-elevated)] p-5 rounded-lg border border-[var(--color-border)] h-[350px] flex flex-col gap-4">
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
    <div className="bg-[var(--color-bg-elevated)] p-5 rounded-lg border border-[var(--color-border)] h-[350px] flex flex-col">
      <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">
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
                  backgroundColor: "var(--color-bg-elevated)",
                  borderColor: "var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-text-primary)",
                }}
                formatter={(value: number) => [`${value} transaction(s)`, "Paiements"]}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
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