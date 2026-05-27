import { useState } from "react";
import { TopBar } from "@/components/layout/AppLayout";
import { useProducts } from "./hooks/useProducts";
import { useCategories } from "./hooks/useCategories";
import { ProductTable } from "./components/ProductTable";
import { ProductSearchBar } from "./components/ProductSearchBar";
import { ProductFormModal } from "./components/ProductFormModal";
import { CategoryManager } from "./components/CategoryManager";
import type { Product, ProductFormData } from "@/types";

export function ProductsPage() {
  const {
    products,
    total,
    page,
    pageSize,
    stats,
    isLoading,
    search,
    categoryId,
    create,
    update,
    remove,
    handleSearch,
    handleCategoryFilter,
    handlePageChange,
  } = useProducts();

  const { categories, create: createCategory, update: updateCategory, remove: removeCategory } =
    useCategories();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleEdit = (product: Product) => { setEditingProduct(product); setIsFormOpen(true); };
  const handleDelete = (product: Product) => { remove(product.id); };
  const handleFormSubmit = async (data: ProductFormData): Promise<boolean> => {
    if (editingProduct) return update(editingProduct.id, data);
    return create(data);
  };
  const handleFormClose = () => { setIsFormOpen(false); setEditingProduct(null); };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopBar
        title="Produits"
        actions={
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              className="btn-outline-gold"
              style={{ borderRadius: "var(--radius-lg)" }}
              onClick={() => setIsCategoryOpen(true)}
            >
              Catégories
            </button>
            <button
              className="btn-primary"
              onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
              Nouveau produit
            </button>
          </div>
        }
      />

      <main style={{ padding: "var(--space-container)", maxWidth: 1440, margin: "0 auto", width: "100%" }}>
        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "var(--space-card-gap)",
            marginBottom: "var(--space-section)",
          }}
        >
          {(() => {
            const statsCards: { label: string; value: number; icon: string; sub: string; error?: boolean; trend?: string }[] = [
              { label: "Produits actifs", value: stats.totalProducts, icon: "inventory_2", sub: "Catalogue actif" },
              { label: "Total variantes", value: stats.totalVariants, icon: "style", sub: "Couleurs et Tailles" },
              { label: "Stocks bas", value: stats.lowStockVariants, icon: "warning", error: true, sub: "Nécessite réassort" },
            ];
            return statsCards.map((card) => (
            <div
              key={card.label}
              className="glass-panel"
              style={{ padding: "24px", borderRadius: "var(--radius-xl)", display: "flex", flexDirection: "column", gap: "8px", position: "relative", overflow: "hidden" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--color-secondary)" }}>
                <span style={{ fontSize: "var(--text-label-md)", fontWeight: "var(--fw-label-md)", letterSpacing: "var(--ls-label-md)" }}>{card.label}</span>
                <span className="material-symbols-outlined" style={{ color: card.error ? "var(--color-error)" : "inherit" }}>{card.icon}</span>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-display-lg)",
                  fontWeight: "var(--fw-display-lg)",
                  color: "var(--color-on-surface)",
                  marginTop: "8px",
                }}
              >
                {card.value?.toLocaleString("fr-DZ")}
              </div>
              {card.trend && (
                <div style={{ fontSize: "var(--text-label-sm)", color: "var(--color-tertiary)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>trending_up</span>
                  {card.trend}
                </div>
              )}
              {card.sub && (
                <div style={{ fontSize: "var(--text-label-sm)", color: card.error ? "var(--color-error)" : "var(--color-secondary)" }}>
                  {card.sub}
                </div>
              )}
            </div>
          ));
        })()}
        </div>

        {/* Table card */}
        <div className="glass-panel" style={{ borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
          {/* Controls */}
          <div
            style={{
              padding: "24px",
              borderBottom: "1px solid rgba(208,197,175,0.3)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "rgba(255,255,255,0.5)",
            }}
          >
            <div style={{ position: "relative", width: 384 }}>
              <span
                className="material-symbols-outlined"
                style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--color-secondary)", fontSize: 22, pointerEvents: "none" }}
              >
                search
              </span>
              <ProductSearchBar
                onSearch={handleSearch}
                onCategoryChange={handleCategoryFilter}
                categories={categories}
                value={search}
                categoryId={categoryId}
              />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn-border">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>filter_list</span>
                Filtres
              </button>
              <button className="btn-border">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>download</span>
                Exporter
              </button>
            </div>
          </div>

          {/* Table */}
          <ProductTable
            products={products}
            total={total}
            page={page}
            pageSize={pageSize}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPageChange={handlePageChange}
          />
        </div>
      </main>

      <ProductFormModal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        categories={categories}
        editProduct={editingProduct}
      />
      <CategoryManager
        isOpen={isCategoryOpen}
        onClose={() => setIsCategoryOpen(false)}
        categories={categories}
        onCreate={createCategory}
        onUpdate={updateCategory}
        onDelete={removeCategory}
      />
    </div>
  );
}
