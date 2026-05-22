import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Sale } from "@/types";
import { FileText, Eye } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const columnHelper = createColumnHelper<Sale>();

interface SaleTableProps {
  sales: Sale[];
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
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--color-text-primary)]">
            <FileText className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            {val}
          </div>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      header: "Date",
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor("customer.name", {
      header: "Client",
      cell: (info) => {
        const name = info.getValue();
        return name ? (
          <span className="font-medium text-[var(--color-text-primary)]">{name}</span>
        ) : (
          <span className="text-[var(--color-text-muted)] italic">Passager</span>
        );
      },
    }),
    columnHelper.accessor("items", {
      header: "Articles",
      cell: (info) => {
        const items = info.getValue();
        const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0);
        return <span>{totalItems} art.</span>;
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
      header: "Paiement",
      cell: (info) => {
        const method = info.getValue();
        return PAYMENT_METHOD_LABELS[method] || method;
      },
    }),
    columnHelper.accessor("status", {
      header: "Statut",
      cell: (info) => {
        const status = info.getValue();
        if (status === "completed") {
          return <Badge variant="success">Complétée</Badge>;
        }
        if (status === "refunded") {
          return <Badge variant="warning">Remboursée</Badge>;
        }
        return <Badge variant="secondary">{status}</Badge>;
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
    <div className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg overflow-hidden flex flex-col">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm text-[var(--color-text-secondary)]">
          <thead className="bg-[#1e2330] border-b border-[var(--color-border)] text-[var(--color-text-muted)] uppercase text-xs">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-5 py-4 font-semibold whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-8 text-center text-[var(--color-text-muted)]">
                  Aucune vente trouvée
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-[#1e2330]/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-5 py-3 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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