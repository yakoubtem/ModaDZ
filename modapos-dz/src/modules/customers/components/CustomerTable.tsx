import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Pencil, Trash2, Eye, Phone, Mail, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import type { CustomerWithStats } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/modules/auth/AuthContext";

interface CustomerTableProps {
  customers: CustomerWithStats[];
  isLoading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onEdit: (customer: CustomerWithStats) => void;
  onDelete: (customer: CustomerWithStats) => void;
  onViewProfile: (id: number) => void;
  onPageChange: (page: number) => void;
}

// ─── Sort icon helper ─────────────────────────────────────
function SortIcon({ direction }: { direction: "asc" | "desc" | false }) {
  if (!direction) return <ChevronsUpDown className="w-3 h-3 ml-1 text-[var(--color-text-muted)]" />;
  return direction === "asc"
    ? <ChevronUp className="w-3 h-3 ml-1 text-[var(--color-accent)]" />
    : <ChevronDown className="w-3 h-3 ml-1 text-[var(--color-accent)]" />;
}

export function CustomerTable({
  customers,
  isLoading,
  total,
  page,
  pageSize,
  onEdit,
  onDelete,
  onViewProfile,
  onPageChange,
}: CustomerTableProps) {
  const { can } = useAuth();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const columns = useMemo<ColumnDef<CustomerWithStats>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Client",
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {row.original.name}
            </p>
            <div className="flex gap-3 mt-0.5">
              {row.original.phone && (
                <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                  <Phone className="w-2.5 h-2.5" />
                  {row.original.phone}
                </span>
              )}
              {row.original.email && (
                <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                  <Mail className="w-2.5 h-2.5" />
                  {row.original.email}
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "totalOrders",
        header: "Commandes",
        cell: ({ getValue }) => (
          <span className="text-sm tabular-nums text-[var(--color-text-primary)]">
            {getValue() as number}
          </span>
        ),
      },
      {
        accessorKey: "totalSpent",
        header: "Total dépensé",
        cell: ({ getValue }) => (
          <span className="text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">
            {formatCurrency(getValue() as number)}
          </span>
        ),
      },
      {
        accessorKey: "debt",
        header: "Crédit en attente",
        cell: ({ getValue }) => {
          const debt = getValue() as number;
          return debt > 0 ? (
            <Badge variant="danger">{formatCurrency(debt)}</Badge>
          ) : (
            <span className="text-xs text-[var(--color-text-muted)]">—</span>
          );
        },
      },
      {
        accessorKey: "lastPurchaseDate",
        header: "Dernier achat",
        cell: ({ getValue }) => {
          const d = getValue() as string | undefined;
          return (
            <span className="text-xs text-[var(--color-text-muted)]">
              {d ? formatDate(d) : "—"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const customer = row.original;
          if (deleteConfirmId === customer.id) {
            return (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    onDelete(customer);
                    setDeleteConfirmId(null);
                  }}
                  className="px-2 py-1 text-xs font-medium text-[var(--color-danger)] bg-[var(--color-danger-subtle)] rounded-[var(--radius-sm)] hover:bg-[var(--color-danger)]/20 transition-colors"
                >
                  Oui
                </button>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-2 py-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  Non
                </button>
              </div>
            );
          }
          return (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onViewProfile(customer.id)}
                title="Voir le profil"
                className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)] transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onEdit(customer)}
                title="Modifier"
                className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-overlay)] transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              {can("customers.delete") && (
                <button
                  onClick={() => setDeleteConfirmId(customer.id)}
                  title="Supprimer"
                  className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deleteConfirmId, onEdit, onDelete, onViewProfile, can]
  );

  const table = useReactTable({
    data: customers,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    rowCount: total,
  });

  const totalPages = Math.ceil(total / pageSize);
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  if (isLoading) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] bg-[var(--color-bg-surface)] overflow-hidden">
        <div className="divide-y divide-[var(--color-border)]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-4 px-5 py-4">
              <div className="h-4 bg-[var(--color-bg-subtle)] rounded animate-pulse w-40" />
              <div className="h-4 bg-[var(--color-bg-subtle)] rounded animate-pulse w-16 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-sm)] border-dashed">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Aucun client trouvé
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] overflow-hidden">
        {/* Header */}
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr
                key={hg.id}
                className="border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]"
              >
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={cn(
                      "px-5 py-3 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide text-left select-none",
                      header.column.getCanSort() && "cursor-pointer hover:text-[var(--color-text-secondary)]"
                    )}
                  >
                    <span className="flex items-center">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <SortIcon direction={header.column.getIsSorted()} />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="group bg-[var(--color-bg-surface)] hover:bg-[var(--color-accent-subtle)]/40 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-5 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-[var(--color-text-muted)]">
            Affichage de{" "}
            <span className="text-[var(--color-text-secondary)]">{from}–{to}</span>{" "}
            sur{" "}
            <span className="text-[var(--color-text-secondary)]">{total}</span>{" "}
            clients
          </p>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={cn(
                  "w-8 h-8 text-xs font-medium rounded-[var(--radius-sm)] transition-colors",
                  p === page
                    ? "bg-[var(--color-accent)] text-white"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
