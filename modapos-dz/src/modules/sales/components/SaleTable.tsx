import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { SaleSummary } from "@/types";
import { FileText, Eye, FileSearch } from "lucide-react";
import { PaymentStatusBadge } from "@/components/ui/PaymentStatusBadge";
import { useTranslation } from "@/hooks/useTranslation";

const columnHelper = createColumnHelper<SaleSummary>();

interface SaleTableProps {
  sales: SaleSummary[];
  onView: (id: number) => void;
}

export function SaleTable({ sales, onView }: SaleTableProps) {
  const { t, isRtl } = useTranslation();

  const PAYMENT_METHOD_LABELS: Record<string, string> = {
    cash: t("common.payment_methods.cash"),
    card: t("common.payment_methods.card"),
    transfer: t("common.payment_methods.transfer"),
  };

  const columns = [
    columnHelper.accessor("receiptNumber", {
      header: t("sales.table.receipt"),
      cell: (info) => {
        const val = info.getValue() || `-`;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "monospace", fontSize: 12, fontWeight: 500, color: "var(--color-on-surface)" }}>
            <FileText style={{ width: 16, height: 16, color: "var(--color-secondary)", flexShrink: 0 }} />
            {val}
          </div>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      header: t("sales.table.date"),
      cell: (info) => (
        <span style={{ color: "var(--color-secondary)", fontWeight: 500, fontSize: 14 }}>
          {formatDate(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.customer?.name, {
      id: "customerName",
      header: t("sales.table.customer"),
      cell: (info) => {
        const name = info.getValue();
        return name ? (
          <span style={{ fontWeight: 600, color: "var(--color-on-surface)", fontSize: 14 }}>
            {name}
          </span>
        ) : (
          <span style={{ color: "var(--color-secondary)", fontStyle: "italic", fontWeight: 400, fontSize: 14 }}>{t("sales.table.passenger")}</span>
        );
      },
    }),
    columnHelper.accessor("items", {
      header: t("sales.table.items"),
      cell: (info) => {
        const items = info.getValue();
        const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0);
        return <span style={{ color: "var(--color-secondary)", fontWeight: 500, fontSize: 14 }}>{totalItems} {t("sales.table.items_unit")}</span>;
      },
    }),
    columnHelper.accessor("total", {
      header: t("sales.table.total"),
      cell: (info) => (
        <span style={{ fontWeight: 700, color: "var(--color-on-surface)", fontSize: 14, fontVariantNumeric: "tabular-nums" }}>
          {formatCurrency(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor("paymentMethod", {
      header: t("sales.table.payment_method"),
      cell: (info) => {
        const method = info.getValue();
        const label = PAYMENT_METHOD_LABELS[method] || method;
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "3px 10px",
              borderRadius: "var(--radius-md)",
              background: "rgba(245,243,238,0.7)",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--color-secondary)",
              border: "1px solid rgba(208,197,175,0.3)",
            }}
          >
            {label}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "paymentStatus",
      header: t("sales.table.paid"),
      cell: (info) => (
        <PaymentStatusBadge
          amountPaid={info.row.original.amountPaid}
          total={info.row.original.total}
          compact
        />
      ),
    }),
    columnHelper.accessor("status", {
      header: t("sales.table.status"),
      cell: (info) => {
        const status = info.getValue();
        const config = status === "completed"
          ? { bg: "var(--color-success-subtle, rgba(77,139,139,0.08))", color: "var(--color-success, var(--color-tertiary))", border: "rgba(77,139,139,0.2)", label: t("common.status.completed") }
          : status === "refunded"
            ? { bg: "var(--color-danger-subtle, rgba(186,26,26,0.06))", color: "var(--color-danger, var(--color-error))", border: "rgba(186,26,26,0.18)", label: t("common.status.refunded") }
            : { bg: "rgba(208,197,175,0.1)", color: "var(--color-secondary)", border: "rgba(208,197,175,0.3)", label: status };
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 12px",
              borderRadius: "999px",
              fontSize: 12,
              fontWeight: 700,
              background: config.bg,
              color: config.color,
              border: `1px solid ${config.border}`,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: config.color }} />
            {config.label}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: (info) => (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
          <button
            onClick={() => onView(info.row.original.id)}
            title={t("sales.details.title")}
            style={{
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-md)",
              background: "none",
              border: "1px solid rgba(208,197,175,0.2)",
              cursor: "pointer",
              color: "var(--color-secondary)",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-primary)"; e.currentTarget.style.background = "rgba(212,175,55,0.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-secondary)"; e.currentTarget.style.background = "none"; }}
          >
            <Eye style={{ width: 16, height: 16 }} />
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: sales,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-body-sm)" }}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                style={{ background: "rgba(245,243,238,0.7)", borderBottom: "1px solid rgba(208,197,175,0.3)" }}
              >
                {headerGroup.headers.map((header, idx) => (
                  <th
                    key={header.id}
                    style={{
                      padding: "14px 20px",
                      textAlign: idx === 8 ? (isRtl ? "left" : "right") : (isRtl ? "right" : "left"),
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--color-secondary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div
                    style={{
                      padding: "64px 24px",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <FileSearch style={{ width: 48, height: 48, color: "var(--color-outline)", opacity: 0.5 }} />
                    <p style={{ fontSize: "var(--text-body-md)", color: "var(--color-secondary)" }}>
                      {t("sales.table.no_sales_found")}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  style={{
                    borderBottom: "1px solid rgba(208,197,175,0.15)",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(212,175,55,0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{
                        padding: "14px 20px",
                        whiteSpace: "nowrap",
                        verticalAlign: "middle",
                        textAlign: isRtl ? "right" : "left"
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}