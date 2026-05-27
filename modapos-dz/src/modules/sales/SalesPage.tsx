import { TopBar } from "@/components/layout/AppLayout";
import { useSalesHistory } from "./hooks/useSalesHistory";
import { SaleTable } from "./components/SaleTable";
import { SaleFilters as SaleFiltersComponent } from "./components/SaleFilters";
import { SaleDetailsModal } from "./components/SaleDetailsModal";

export function SalesPage() {
  const {
    sales,
    total,
    page,
    pageSize,
    isLoading,
    filters,
    detailSale,
    isDetailOpen,
    setFilters,
    resetFilters,
    handlePageChange,
    openDetail,
    closeDetail,
    refund,
  } = useSalesHistory();

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopBar title="Ventes" description="Historique de toutes vos transactions." />

      <main style={{ padding: "var(--space-container)", maxWidth: 1440, margin: "0 auto", width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Filters */}
          <SaleFiltersComponent
             filters={filters}
             onChange={setFilters}
             onReset={resetFilters}
             total={total}
          />

          {/* Table container */}
          <div
            className="glass-panel"
            style={{ borderRadius: "var(--radius-xl)", overflow: "hidden" }}
          >
            {isLoading && sales.length === 0 ? (
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 48, borderRadius: 8 }} />
                ))}
              </div>
            ) : (
              <SaleTable sales={sales} onView={openDetail} />
            )}

            {/* Pagination */}
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
                  Affichage de {(page - 1) * pageSize + 1} à {Math.min(page * pageSize, total)} sur {total} ventes
                </p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="btn-border"
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                    style={{ opacity: page === 1 ? 0.4 : 1 }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_left</span>
                  </button>
                  <button
                    className="btn-border"
                    onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    style={{ opacity: page === totalPages ? 0.4 : 1 }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <SaleDetailsModal isOpen={isDetailOpen} onClose={closeDetail} sale={detailSale} onRefund={refund} />
    </div>
  );
}