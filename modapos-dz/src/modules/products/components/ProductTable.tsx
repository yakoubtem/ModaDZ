import { useState } from "react";
import {
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Package,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SkeletonTable } from "@/components/ui/Skeleton";
import type { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ProductTableProps {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onPageChange: (page: number) => void;
}

function ProductImage({ imagePath, name }: { imagePath?: string; name: string }) {
  if (!imagePath) {
    return (
      <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-bg-overlay)] flex items-center justify-center text-[var(--color-text-muted)] shrink-0">
        <Package className="w-4 h-4" />
      </div>
    );
  }
  return (
    <img
      src={`media://${imagePath}`}
      alt={name}
      className="w-10 h-10 rounded-[var(--radius-md)] object-cover shrink-0 border border-[var(--color-border)]"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

function StockSummary({ variants }: { variants: Product["variants"] }) {
  const totalStock = variants.reduce((s, v) => s + v.stock, 0);
  const lowStock = variants.filter((v) => v.stock <= 5);

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm text-[var(--color-text-primary)]">
        {totalStock} unités
      </span>
      <span className="text-xs text-[var(--color-text-muted)]">
        {variants.length} variante{variants.length !== 1 ? "s" : ""}
      </span>
      {lowStock.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-[var(--color-warning)]">
          <AlertTriangle className="w-3 h-3" />
          {lowStock.length} stock bas
        </div>
      )}
    </div>
  );
}

export function ProductTable({
  products,
  total,
  page,
  pageSize,
  isLoading,
  onEdit,
  onDelete,
  onPageChange,
}: ProductTableProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const totalPages = Math.ceil(total / pageSize);
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  if (isLoading) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-overlay)]">
          <div className="grid grid-cols-[40px_2fr_1fr_1fr_1fr_1fr_80px] gap-4">
            {["", "Produit", "Catégorie", "Prix", "Stock", "Statut", ""].map((h, i) => (
              <span key={i} className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                {h}
              </span>
            ))}
          </div>
        </div>
        <SkeletonTable rows={8} cols={7} />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 rounded-[var(--radius-lg)] border border-[var(--color-border)] border-dashed">
        <div className="w-14 h-14 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center mb-4">
          <ImageIcon className="w-7 h-7 text-[var(--color-text-muted)]" />
        </div>
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">
          Aucun produit trouvé
        </p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          Créez votre premier produit ou modifiez les filtres.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Table */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[52px_2fr_1fr_110px_1.2fr_100px_88px] gap-4 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-overlay)]">
          {["", "Produit", "Catégorie", "Prix", "Stock", "Statut", "Actions"].map((h, i) => (
            <span key={i} className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-[var(--color-border)]">
          {products.map((product) => (
            <div
              key={product.id}
              className={cn(
                "group grid grid-cols-[52px_2fr_1fr_110px_1.2fr_100px_88px] gap-4 px-4 py-3 items-center",
                "bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] transition-colors duration-100"
              )}
            >
              {/* Image */}
              <ProductImage imagePath={product.imagePath} name={product.name} />

              {/* Name + SKU */}
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                  {product.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] font-mono mt-0.5">
                  {product.sku}
                </p>
              </div>

              {/* Category */}
              {product.category ? (
                <Badge variant="accent">{product.category.name}</Badge>
              ) : (
                <span className="text-xs text-[var(--color-text-muted)]">—</span>
              )}

              {/* Price */}
              <span className="text-sm font-semibold text-[var(--color-text-primary)] tabular-nums">
                {formatCurrency(product.price)}
              </span>

              {/* Stock summary */}
              <StockSummary variants={product.variants} />

              {/* Status */}
              <Badge variant={product.isActive ? "success" : "danger"} dot>
                {product.isActive ? "Actif" : "Inactif"}
              </Badge>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {deleteConfirmId === product.id ? (
                  <>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        onDelete(product);
                        setDeleteConfirmId(null);
                      }}
                    >
                      Oui
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirmId(null)}
                    >
                      Non
                    </Button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onEdit(product)}
                      className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-overlay)] transition-colors"
                      title="Modifier"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(product.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)] transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1 pt-4">
          <p className="text-xs text-[var(--color-text-muted)]">
            Affichage de <span className="text-[var(--color-text-secondary)]">{from}–{to}</span> sur{" "}
            <span className="text-[var(--color-text-secondary)]">{total}</span> produits
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {/* Page numbers */}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = i + 1;
              return (
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
              );
            })}
            {totalPages > 5 && (
              <span className="text-xs text-[var(--color-text-muted)] px-1">…{totalPages}</span>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
