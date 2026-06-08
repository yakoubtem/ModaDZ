import { useState } from "react";
import { TopBar } from "@/components/layout/AppLayout";
import { useSuppliers } from "./hooks/useSuppliers";
import { SupplierTable } from "./components/SupplierTable";
import { SupplierFilters } from "./components/SupplierFilters";
import { SupplierFormModal } from "./components/SupplierFormModal";
import { SupplierKPICards } from "./components/SupplierKPICards";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/modules/auth/AuthContext";
import { useIPC } from "@/hooks/useIPC";
import type { SupplierWithStats, PaginatedSuppliers } from "@/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export function SuppliersPage() {
  const { t, isRtl } = useTranslation();
  const { can } = useAuth();
  const api = useIPC();
  const {
    suppliers,
    total,
    page,
    pageSize,
    isLoading,
    search,
    sortBy,
    sortOrder,
    summary,
    handleSearch,
    handlePageChange,
    handleSort,
    create,
    update,
    remove,
  } = useSuppliers();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierWithStats | null>(null);

  const handleEdit = (supplier: SupplierWithStats) => {
    setEditingSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any): Promise<boolean> => {
    if (editingSupplier) {
      return update(editingSupplier.id, data);
    } else {
      return create(data);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingSupplier(null);
  };

  const handleExport = async () => {
    const headers = [
      t("suppliers.table.name"),
      t("suppliers.table.phone"),
      t("suppliers.table.email"),
      t("suppliers.table.address"),
      t("suppliers.table.total_purchases"),
      t("suppliers.table.total_amount"),
      t("suppliers.table.remaining_debt"),
      t("suppliers.table.last_purchase"),
    ];

    try {
      const res = await api<PaginatedSuppliers>("suppliers:getAll", { page: 1, pageSize: 100000, search: search || undefined });
      const rows = res.suppliers.map((s) => [
        s.name,
        s.phone || "",
        s.email || "",
        s.address || "",
        s.totalPurchases,
        s.totalAmount,
        s.remainingDebt,
        s.lastPurchaseDate ? formatDate(s.lastPurchaseDate) : "",
      ]);
      const csvContent = [
        headers.join(","),
        ...rows.map((r) => r.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")),
      ].join("\n");

      const success = await api<boolean>("suppliers:exportCSV", csvContent, `fournisseurs_${Date.now()}.csv`);
      if (success) {
        toast.success(t("common.toasts.export_success") || "Exportation réussie.");
      }
    } catch {
      toast.error(t("common.toasts.export_error") || "Erreur lors de l'exportation.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopBar title="" />

      <main style={{ padding: "var(--space-container)", maxWidth: 1440, margin: "0 auto", width: "100%" }}>
        {/* Page header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "var(--space-section)",
            paddingTop: "32px",
            flexDirection: isRtl ? "row-reverse" : "row",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-headline-lg)",
                fontWeight: "var(--fw-headline-lg)",
                color: "var(--color-on-surface)",
                marginBottom: "8px",
              }}
            >
              {t("suppliers.title")}
            </h2>
            <p style={{ fontSize: "var(--text-body-md)", color: "var(--color-on-surface-variant)" }}>
              {t("suppliers.subtitle")}
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexDirection: isRtl ? "row-reverse" : "row" }}>
            <button className="btn-border" onClick={handleExport}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                download
              </span>
              {t("common.buttons.export")}
            </button>
            {can("suppliers.manage") && (
              <button
                className="btn-primary"
                onClick={() => {
                  setEditingSupplier(null);
                  setIsFormOpen(true);
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  local_shipping
                </span>
                {t("suppliers.add_supplier")}
              </button>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <SupplierKPICards totalSuppliers={total} summary={summary} isLoading={isLoading} />

        {/* Filter controls */}
        <div style={{ marginBottom: "var(--space-card-gap)" }}>
          <SupplierFilters search={search} onSearchChange={handleSearch} />
        </div>

        {/* Suppliers table */}
        <div
          style={{
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid var(--color-surface-variant)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-soft)",
            overflow: "hidden",
          }}
        >
          <SupplierTable
            suppliers={suppliers}
            total={total}
            page={page}
            pageSize={pageSize}
            isLoading={isLoading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onEdit={handleEdit}
            onDelete={(s) => remove(s.id)}
            onPageChange={handlePageChange}
            onSort={handleSort}
          />
        </div>
      </main>

      <SupplierFormModal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        editSupplier={editingSupplier}
      />
    </div>
  );
}
