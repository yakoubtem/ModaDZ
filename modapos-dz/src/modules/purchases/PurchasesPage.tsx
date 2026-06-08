import { useState } from "react";
import { TopBar } from "@/components/layout/AppLayout";
import { usePurchases } from "./hooks/usePurchases";
import { PurchaseTable } from "./components/PurchaseTable";
import { PurchaseFilters } from "./components/PurchaseFilters";
import { PurchaseFormModal } from "./components/PurchaseFormModal";
import { PurchaseDetailsModal } from "./components/PurchaseDetailsModal";
import { PurchaseKPICards } from "./components/PurchaseKPICards";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/modules/auth/AuthContext";
import { useIPC } from "@/hooks/useIPC";
import type { Purchase, PaginatedPurchases } from "@/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export function PurchasesPage() {
  const { t, isRtl } = useTranslation();
  const { can } = useAuth();
  const api = useIPC();

  const {
    purchases,
    total,
    page,
    pageSize,
    isLoading,
    search,
    supplierId,
    status,
    from,
    to,
    suppliers,
    products,
    summary,
    loadFormData,
    handleSearch,
    handleSupplierFilter,
    handleStatusFilter,
    handleDateFilter,
    handlePageChange,
    create,
    remove,
    getById,
  } = usePurchases();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  const handleOpenForm = async () => {
    setIsFormOpen(true);
    await loadFormData();
  };

  const handleViewDetails = async (purchase: Purchase) => {
    try {
      const full = await getById(purchase.id);
      setSelectedPurchase(full);
      setIsDetailsOpen(true);
    } catch {
      toast.error("Impossible de charger les détails de l'achat.");
    }
  };

  const handleFormSubmit = async (data: any): Promise<boolean> => {
    return create(data);
  };

  const handleExport = async () => {
    const headers = [
      t("purchases.table.reference") || "Référence",
      t("purchases.table.supplier") || "Fournisseur",
      t("purchases.table.date") || "Date",
      t("purchases.table.subtotal") || "Sous-total",
      t("purchases.table.discount") || "Remise",
      t("purchases.table.total") || "Total",
      t("purchases.table.amount_paid") || "Payé",
      t("purchases.table.remaining_debt") || "Dette",
      t("purchases.table.status") || "Statut",
    ];

    try {
      const res = await api<PaginatedPurchases>("purchases:getAll", {
        page: 1,
        pageSize: 100000,
        search: search || undefined,
        supplierId,
        status,
        from: from || undefined,
        to: to || undefined,
      });

      const rows = res.purchases.map((p) => {
        const remainingDebt = Math.max(0, p.total - p.amountPaid);
        return [
          p.reference,
          p.supplier?.name || "",
          formatDate(p.createdAt),
          p.subtotal,
          p.discount,
          p.total,
          p.amountPaid,
          remainingDebt,
          p.status === "paid"
            ? t("purchases.status.paid")
            : p.status === "partial"
            ? t("purchases.status.partial")
            : t("purchases.status.unpaid"),
        ];
      });

      const csvContent = [
        headers.join(","),
        ...rows.map((r) => r.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")),
      ].join("\n");

      const success = await api<boolean>("purchases:exportCSV", csvContent, `achats_${Date.now()}.csv`);
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
              {t("purchases.title")}
            </h2>
            <p style={{ fontSize: "var(--text-body-md)", color: "var(--color-on-surface-variant)" }}>
              {t("purchases.subtitle")}
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexDirection: isRtl ? "row-reverse" : "row" }}>
            <button className="btn-border" onClick={handleExport}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                download
              </span>
              {t("common.buttons.export")}
            </button>
            {can("purchases.manage") && (
              <button className="btn-primary" onClick={handleOpenForm}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  add_shopping_cart
                </span>
                {t("purchases.add_purchase")}
              </button>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <PurchaseKPICards summary={summary} isLoading={isLoading} />

        {/* Filter controls */}
        <div style={{ marginBottom: "var(--space-card-gap)" }}>
          <PurchaseFilters
            search={search}
            supplierId={supplierId}
            status={status}
            from={from}
            to={to}
            suppliers={suppliers}
            onSearch={handleSearch}
            onSupplierChange={handleSupplierFilter}
            onStatusChange={handleStatusFilter}
            onDateRange={handleDateFilter}
          />
        </div>

        {/* Purchases table */}
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
          <PurchaseTable
            purchases={purchases}
            total={total}
            page={page}
            pageSize={pageSize}
            isLoading={isLoading}
            onViewDetails={handleViewDetails}
            onDelete={(p) => remove(p.id)}
            onPageChange={handlePageChange}
          />
        </div>
      </main>

      <PurchaseFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        suppliers={suppliers}
        products={products}
      />

      <PurchaseDetailsModal
        isOpen={isDetailsOpen}
        purchase={selectedPurchase}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedPurchase(null);
        }}
      />
    </div>
  );
}
