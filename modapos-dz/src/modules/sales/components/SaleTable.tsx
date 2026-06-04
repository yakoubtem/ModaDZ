import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { SaleSummary } from "@/types";
import { FileText, Eye, FileSearch } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PaymentStatusBadge } from "@/components/ui/PaymentStatusBadge";

const columnHelper = createColumnHelper<SaleSummary>();

interface SaleTableProps {
  sales: SaleSummary[];
  onView: (id: number) => void;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Espèces",
  card: "Carte",
  transfer: "Virement",
};

export function SaleTable({ sales, onView }: SaleTableProps) {
  const columns = [
    columnHelper.accessor("receiptNumber", {
      header: "N° Reçu",
      cell: (info) => {
        const val = info.getValue() || `-`;
        return (
          <div className="flex items-center gap-2.5 font-mono text-xs font-medium text-[var(--color-text-primary)]">
            <FileText className="w-4 h-4 text-[var(--color-text-muted)]" />
            {val}
          </div>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      header: "Date",
      cell: (info) => (
        <span className="text-[var(--color-text-secondary)] font-medium">
          {formatDate(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.customer?.name, {
      id: "customerName",
      header: "Client",
      cell: (info) => {
        const name = info.getValue();
        return name ? (
          <span className="font-semibold text-[var(--color-text-primary)]">
            {name}
          </span>
        ) : (
          <span className="text-[var(--color-text-muted)] italic font-normal">Passager</span>
        );
      },
    }),
    columnHelper.accessor("items", {
      header: "Articles",
      cell: (info) => {
        const items = info.getValue();
        const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0);
        return <span className="text-[var(--color-text-secondary)] font-medium">{totalItems} art.</span>;
      },
    }),
    columnHelper.accessor("total", {
      header: "Total",
      cell: (info) => (
        <span className="font-bold text-[var(--color-text-primary)]">
          {formatCurrency(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor("paymentMethod", {
      header: "Moyen",
      cell: (info) => {
        const method = info.getValue();
        const label = PAYMENT_METHOD_LABELS[method] || method;
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] text-[11px] font-semibold text-[var(--color-text-secondary)] border border-[var(--color-border)]/60">
            {label}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "paymentStatus",
      header: "Paiement",
      cell: (info) => (
        <PaymentStatusBadge
          amountPaid={info.row.original.amountPaid}
          total={info.row.original.total}
          compact
        />
      ),
    }),
    columnHelper.accessor("status", {
      header: "Statut",
      cell: (info) => {
        const status = info.getValue();
        if (status === "completed") {
          return <Badge variant="success" dot>Complétée</Badge>;
        }
        if (status === "refunded") {
          return <Badge variant="warning" dot>Remboursée</Badge>;
        }
        return <Badge variant="default" dot>{status}</Badge>;
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: (info) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onView(info.row.original.id)}
            title="Voir les détails"
          >
            <Eye className="w-4 h-4 text-[var(--color-text-secondary)]" />
          </Button>
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
    <div className="w-full flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[var(--color-text-secondary)]">
          <thead className="bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] uppercase text-[10px]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-4 font-semibold whitespace-nowrap tracking-wider text-[11px] text-[var(--color-text-muted)]"
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
          <tbody className="divide-y divide-[var(--color-border)]">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    variant="search"
                    icon={FileSearch}
                    title="Aucune vente trouvée"
                    description="Aucune vente ne correspond à vos critères de recherche."
                  />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-[var(--color-accent-subtle)]/40 transition-colors duration-100"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-5 whitespace-nowrap align-middle">
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