import { getPaymentStatus } from "@/lib/utils";
import type { PaymentStatus } from "@/lib/utils";

interface PaymentStatusBadgeProps {
  amountPaid: number;
  total: number;
  /** Compact mode: smaller text, no icon (for table rows) */
  compact?: boolean;
}

const CONFIG: Record<
  PaymentStatus,
  { label: string; dot: string; style: React.CSSProperties }
> = {
  paid: {
    label: "Payée",
    dot: "🟢",
    style: {
      background: "var(--color-success-subtle, rgba(39,104,104,0.1))",
      color: "var(--color-success, var(--color-tertiary))",
      border: "1px solid var(--color-success-subtle, rgba(39,104,104,0.2))",
    },
  },
  partial: {
    label: "Partiellement payée",
    dot: "🟠",
    style: {
      background: "rgba(180,83,9,0.08)",
      color: "var(--color-warning)",
      border: "1px solid rgba(180,83,9,0.2)",
    },
  },
  unpaid: {
    label: "Non payée",
    dot: "🔴",
    style: {
      background: "var(--color-danger-subtle, rgba(186,26,26,0.07))",
      color: "var(--color-danger, var(--color-error))",
      border: "1px solid rgba(186,26,26,0.18)",
    },
  },
};

export function PaymentStatusBadge({
  amountPaid,
  total,
  compact = false,
}: PaymentStatusBadgeProps) {
  const status = getPaymentStatus(amountPaid, total);
  const { label, dot, style } = CONFIG[status];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: compact ? 4 : 5,
        padding: compact ? "2px 8px" : "3px 10px",
        borderRadius: "var(--radius-full, 999px)",
        fontSize: compact ? 11 : 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      <span style={{ fontSize: compact ? 8 : 9 }}>{dot}</span>
      {compact ? (
        <span>{status === "partial" ? "Partielle" : label}</span>
      ) : (
        <span>{label}</span>
      )}
    </span>
  );
}
