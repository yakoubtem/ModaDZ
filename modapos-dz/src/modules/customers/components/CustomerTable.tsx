import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Pencil, Trash2, Eye, Phone, Mail } from "lucide-react";
import type { CustomerWithStats } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
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
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--color-on-surface)" }}>
              {row.original.name}
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 2 }}>
              {row.original.phone && (
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--color-secondary)" }}>
                  <Phone style={{ width: 10, height: 10 }} />
                  {row.original.phone}
                </span>
              )}
              {row.original.email && (
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--color-secondary)" }}>
                  <Mail style={{ width: 10, height: 10 }} />
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
          <span style={{ fontSize: 14, fontVariantNumeric: "tabular-nums", color: "var(--color-on-surface)" }}>
            {getValue() as number}
          </span>
        ),
      },
      {
        accessorKey: "totalSpent",
        header: "Total dépensé",
        cell: ({ getValue }) => (
          <span style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "var(--color-on-surface)" }}>
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
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "4px 12px",
                borderRadius: "999px",
                fontSize: 12,
                fontWeight: 700,
                background: "rgba(220,38,38,0.1)",
                color: "#dc2626",
                border: "1px solid rgba(220,38,38,0.3)",
              }}
            >
              {formatCurrency(debt)}
            </span>
          ) : (
            <span style={{ color: "var(--color-outline)", fontSize: 12 }}>—</span>
          );
        },
      },
      {
        accessorKey: "lastPurchaseDate",
        header: "Dernier achat",
        cell: ({ getValue }) => {
          const d = getValue() as string | undefined;
          return (
            <span style={{ fontSize: 12, color: "var(--color-secondary)" }}>
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
              <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                <button
                  onClick={() => { onDelete(customer); setDeleteConfirmId(null); }}
                  className="btn-primary"
                  style={{ padding: "6px 14px", fontSize: 12, height: 36, background: "var(--color-error)" }}
                >
                  Oui
                </button>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  style={{
                    height: 36,
                    padding: "0 12px",
                    background: "none",
                    border: "1px solid rgba(208,197,175,0.3)",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    color: "var(--color-secondary)",
                    fontSize: 12,
                  }}
                >
                  Non
                </button>
              </div>
            );
          }
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
              <button
                onClick={() => onViewProfile(customer.id)}
                title="Voir le profil"
                style={{
                  width: 36, height: 36,
                  display: "flex", alignItems: "center", justifyContent: "center",
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
                <Eye style={{ width: 14, height: 14 }} />
              </button>
              <button
                onClick={() => onEdit(customer)}
                title="Modifier"
                style={{
                  width: 36, height: 36,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: "var(--radius-md)",
                  background: "none",
                  border: "1px solid rgba(208,197,175,0.2)",
                  cursor: "pointer",
                  color: "var(--color-secondary)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-on-surface)"; e.currentTarget.style.background = "rgba(208,197,175,0.15)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-secondary)"; e.currentTarget.style.background = "none"; }}
              >
                <Pencil style={{ width: 14, height: 14 }} />
              </button>
              {can("customers.delete") && (
                <button
                  onClick={() => setDeleteConfirmId(customer.id)}
                  title="Supprimer"
                  style={{
                    width: 36, height: 36,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: "var(--radius-md)",
                    background: "none",
                    border: "1px solid rgba(208,197,175,0.2)",
                    cursor: "pointer",
                    color: "var(--color-secondary)",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-error)"; e.currentTarget.style.background = "rgba(220,38,38,0.06)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-secondary)"; e.currentTarget.style.background = "none"; }}
                >
                  <Trash2 style={{ width: 14, height: 14 }} />
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
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 52, borderRadius: 8 }} />
        ))}
      </div>
    );
  }

  if (customers.length === 0) {
    return (
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
        <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--color-outline)", opacity: 0.5 }}>
          people
        </span>
        <p style={{ fontSize: "var(--text-body-md)", color: "var(--color-secondary)" }}>
          Aucun client trouvé
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-body-sm)" }}>
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr
                key={hg.id}
                style={{ background: "rgba(245,243,238,0.7)", borderBottom: "1px solid rgba(208,197,175,0.3)" }}
              >
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      padding: "14px 20px",
                      textAlign: "left",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--color-secondary)",
                      whiteSpace: "nowrap",
                      cursor: header.column.getCanSort() ? "pointer" : "default",
                      userSelect: "none",
                    }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
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
                  <td key={cell.id} style={{ padding: "14px 20px" }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      {totalPages > 1 && (
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid rgba(208,197,175,0.3)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(245,243,238,0.3)",
          }}
        >
          <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)" }}>
            Affichage de {from}–{to} sur {total} clients
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                style={{
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: p === page ? 700 : 500,
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  cursor: "pointer",
                  background: p === page ? "var(--color-primary)" : "transparent",
                  color: p === page ? "white" : "var(--color-secondary)",
                  transition: "all 0.15s ease",
                }}
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
