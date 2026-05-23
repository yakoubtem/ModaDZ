import { useState } from "react";
import { Plus, Tag, Package, Layers, AlertTriangle } from "lucide-react";
import { PageHeader, PageContent } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { useProducts } from "./hooks/useProducts";
import { useCategories } from "./hooks/useCategories";
import { ProductTable } from "./components/ProductTable";
import { ProductSearchBar } from "./components/ProductSearchBar";
import { ProductFormModal } from "./components/ProductFormModal";
import { CategoryManager } from "./components/CategoryManager";
import type { Product, ProductFormData } from "@/types";
import { cn } from "@/lib/utils";

// ─── Stat Card ───────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color?: "default" | "warning" | "danger";
}

function StatCard({ label, value, icon: Icon, color = "default" }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 px-5 py-4 rounded-[var(--radius-xl)] border shadow-[var(--shadow-sm)]",
        "bg-[var(--color-bg-surface)] transition-shadow hover:shadow-[var(--shadow-md)]",
        color === "warning" && "border-amber-200 bg-amber-50/50",
        color === "danger"  && "border-red-200 bg-red-50/50",
        color === "default" && "border-[var(--color-border)]"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0",
          color === "warning" && "bg-amber-100 text-amber-600",
          color === "danger"  && "bg-red-100 text-red-600",
          color === "default" && "bg-[var(--color-accent-subtle)] text-[var(--color-accent)]"
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-[var(--color-text-primary)] tabular-nums leading-none tracking-tight">
          {value}
        </p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1.5 font-medium uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────
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

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = (product: Product) => {
    remove(product.id);
  };

  const handleFormSubmit = async (data: ProductFormData): Promise<boolean> => {
    if (editingProduct) {
      return update(editingProduct.id, data);
    }
    return create(data);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  return (
    <>
      <PageHeader
        title="Produits"
        description="Gérez votre catalogue de produits et leurs variantes"
        actions={
          <>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsCategoryOpen(true)}
              className="gap-2"
            >
              <Tag className="w-4 h-4" />
              Catégories
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setEditingProduct(null);
                setIsFormOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouveau produit
            </Button>
          </>
        }
      />

      <PageContent>
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard
            label="Produits actifs"
            value={stats.totalProducts}
            icon={Package}
          />
          <StatCard
            label="Total variantes"
            value={stats.totalVariants}
            icon={Layers}
          />
          <StatCard
            label="Stocks bas (≤ 5)"
            value={stats.lowStockVariants}
            icon={AlertTriangle}
            color={stats.lowStockVariants > 0 ? "warning" : "default"}
          />
        </div>

        {/* Search + filters */}
        <div className="mb-4">
          <ProductSearchBar
            onSearch={handleSearch}
            onCategoryChange={handleCategoryFilter}
            categories={categories}
            value={search}
            categoryId={categoryId}
          />
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
      </PageContent>

      {/* Create / Edit modal */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        categories={categories}
        editProduct={editingProduct}
      />

      {/* Category manager */}
      <CategoryManager
        isOpen={isCategoryOpen}
        onClose={() => setIsCategoryOpen(false)}
        categories={categories}
        onCreate={createCategory}
        onUpdate={updateCategory}
        onDelete={removeCategory}
      />
    </>
  );
}
