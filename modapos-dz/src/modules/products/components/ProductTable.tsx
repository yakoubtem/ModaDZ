import { useState } from "react";
import {
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
  AlertTriangle,
} from "lucide-react";
import type { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/modules/auth/AuthContext";

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
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "var(--radius-md)",
          background: "rgba(79,70,53,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-outline)",
          flexShrink: 0,
        }}
      >
        <Package style={{ width: 16, height: 16 }} />
      </div>
    );
  }
  return (
    <img
      src={`media://${imagePath}`}
      alt={name}
      style={{
        width: 40,
        height: 40,
        borderRadius: "var(--radius-md)",
        objectFit: "cover",
        flexShrink: 0,
        border: "1px solid rgba(208,197,175,0.3)",
      }}
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
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 14, color: "var(--color-on-surface)" }}>
        {totalStock} unités
      </span>
      <span style={{ fontSize: 12, color: "var(--color-secondary)" }}>
        {variants.length} variante{variants.length !== 1 ? "s" : ""}
      </span>
      {lowStock.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#f59e0b" }}>
          <AlertTriangle style={{ width: 12, height: 12 }} />
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
  const { can } = useAuth();
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
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

  if (products.length === 0) {
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
          inventory_2
        </span>
        <p style={{ fontSize: "var(--text-body-md)", color: "var(--color-secondary)" }}>
          Aucun produit trouvé. Créez votre premier produit ou modifiez les filtres.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-body-sm)" }}>
          <thead>
            <tr style={{ background: "rgba(245,243,238,0.7)", borderBottom: "1px solid rgba(208,197,175,0.3)" }}>
              {["", "Produit", "Catégorie", "Prix", "Stock", "Statut", "Actions"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "14px 20px",
                    textAlign: "left",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-secondary)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                style={{
                  borderBottom: "1px solid rgba(208,197,175,0.15)",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(212,175,55,0.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* Image */}
                <td style={{ padding: "14px 20px" }}>
                  <ProductImage imagePath={product.imagePath} name={product.name} />
                </td>

                {/* Name + SKU */}
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "var(--color-on-surface)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 280 }}>
                      {product.name}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--color-secondary)", fontFamily: "monospace", marginTop: 2 }}>
                      {product.sku}
                    </p>
                  </div>
                </td>

                {/* Category */}
                <td style={{ padding: "14px 20px" }}>
                  {product.category ? (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "2px 10px",
                        borderRadius: "999px",
                        fontSize: 11,
                        fontWeight: 600,
                        background: "rgba(212,175,55,0.1)",
                        color: "var(--color-primary-container)",
                        border: "1px solid rgba(212,175,55,0.2)",
                      }}
                    >
                      {product.category.name}
                    </span>
                  ) : (
                    <span style={{ color: "var(--color-outline)", fontStyle: "italic", fontSize: 12 }}>—</span>
                  )}
                </td>

                {/* Price */}
                <td style={{ padding: "14px 20px", color: "var(--color-on-surface)", fontWeight: 600, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                  {formatCurrency(product.price)}
                </td>

                {/* Stock summary */}
                <td style={{ padding: "14px 20px" }}>
                  <StockSummary variants={product.variants} />
                </td>

                {/* Status */}
                <td style={{ padding: "14px 20px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "4px 12px",
                      borderRadius: "999px",
                      fontSize: 12,
                      fontWeight: 700,
                      background: product.isActive ? "rgba(34,197,94,0.1)" : "rgba(220,38,38,0.1)",
                      color: product.isActive ? "#16a34a" : "#dc2626",
                      border: `1px solid ${product.isActive ? "rgba(34,197,94,0.3)" : "rgba(220,38,38,0.3)"}`,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: product.isActive ? "#16a34a" : "#dc2626",
                      }}
                    />
                    {product.isActive ? "Actif" : "Inactif"}
                  </span>
                </td>

                {/* Actions */}
                <td style={{ padding: "14px 20px", textAlign: "right" }}>
                  {deleteConfirmId === product.id ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                      <button
                        onClick={() => { onDelete(product); setDeleteConfirmId(null); }}
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
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                      <button
                        onClick={() => onEdit(product)}
                        title="Modifier"
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
                        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-on-surface)"; e.currentTarget.style.background = "rgba(208,197,175,0.15)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-secondary)"; e.currentTarget.style.background = "none"; }}
                      >
                        <Pencil style={{ width: 14, height: 14 }} />
                      </button>
                      {can("products.delete") && (
                        <button
                          onClick={() => setDeleteConfirmId(product.id)}
                          title="Supprimer"
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
                          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-error)"; e.currentTarget.style.background = "rgba(220,38,38,0.06)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-secondary)"; e.currentTarget.style.background = "none"; }}
                        >
                          <Trash2 style={{ width: 14, height: 14 }} />
                        </button>
                      )}
                    </div>
                  )}
                </td>
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
            Affichage de {from}–{to} sur {total} produits
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              style={{
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "var(--radius-md)",
                background: "none",
                border: "1px solid rgba(208,197,175,0.3)",
                cursor: page <= 1 ? "default" : "pointer",
                opacity: page <= 1 ? 0.4 : 1,
                color: "var(--color-secondary)",
              }}
            >
              <ChevronLeft style={{ width: 16, height: 16 }} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = i + 1;
              return (
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
              );
            })}
            {totalPages > 5 && (
              <span style={{ fontSize: 12, color: "var(--color-secondary)", padding: "0 4px" }}>…{totalPages}</span>
            )}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              style={{
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "var(--radius-md)",
                background: "none",
                border: "1px solid rgba(208,197,175,0.3)",
                cursor: page >= totalPages ? "default" : "pointer",
                opacity: page >= totalPages ? 0.4 : 1,
                color: "var(--color-secondary)",
              }}
            >
              <ChevronRight style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
