import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type TableOptions,
} from "@tanstack/react-table";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SkeletonTable } from "./Skeleton";
import { EmptyState } from "./EmptyState";
import type { LucideIcon } from "lucide-react";
import { PackageSearch } from "lucide-react";

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  isLoading?: boolean;
  skeletonRows?: number;
  skeletonCols?: number;
  /** Override empty state */
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  className?: string;
  /** Extra TanStack options */
  tableOptions?: Omit<TableOptions<TData>, "data" | "columns" | "getCoreRowModel">;
}

export function DataTable<TData>({
  data,
  columns,
  isLoading = false,
  skeletonRows = 6,
  skeletonCols,
  emptyIcon = PackageSearch,
  emptyTitle = "Aucune donnée",
  emptyDescription,
  emptyAction,
  className,
  tableOptions,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...tableOptions,
  });

  return (
    <div
      className={cn(
        "w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)]",
        "rounded-[var(--radius-lg)] overflow-hidden flex flex-col",
        className
      )}
    >
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm text-[var(--color-text-secondary)]">
          {/* ── Header ── */}
          <thead className="bg-[var(--color-bg-overlay)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] uppercase text-xs">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-5 py-3.5 font-semibold whitespace-nowrap tracking-wide"
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

          {/* ── Body ── */}
          <tbody className="divide-y divide-[var(--color-border)]">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <SkeletonTable
                    rows={skeletonRows}
                    cols={skeletonCols ?? columns.length}
                  />
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    variant="default"
                    icon={emptyIcon}
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-[var(--color-bg-overlay)]/60 transition-colors duration-100"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-5 py-3 whitespace-nowrap">
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
