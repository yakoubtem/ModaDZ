import { TopBar } from "@/components/layout/AppLayout";
import { useSalesHistory } from "./hooks/useSalesHistory";
import { SaleTable } from "./components/SaleTable";
import { SaleFilters as SaleFiltersComponent } from "./components/SaleFilters";
import { SaleDetailsModal } from "./components/SaleDetailsModal";
import { useTranslation } from "@/hooks/useTranslation";

export function SalesPage() {
  const { t } = useTranslation();
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
      <TopBar title={t("sales.title")} description={t("sales.description")} />

      <main style={{ padding: "40px var(--space-container) 80px", maxWidth: 1600, margin: "0 auto", width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
          {/* Filters */}
          <SaleFiltersComponent
             filters={filters}
             onChange={setFilters}
             onReset={resetFilters}
          />

          {/* Table container & header */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-text-primary)" }}>
                  {t("sales.table.list_title")}
                </h3>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "9999px",
                    background: "var(--color-bg-subtle)",
                    border: "1px solid var(--color-border)",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--color-text-secondary)",
                    padding: "2px 8px"
                  }}
                >
                  {t("sales.table.transaction_count", { count: total })}
                </span>
              </div>
            </div>

            <div
              className="glass-panel"
              style={{ borderRadius: "var(--radius-xl)", overflow: "hidden" }}
            >
              {isLoading && sales.length === 0 ? (
                <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: 56, borderRadius: 8 }} />
                  ))}
                </div>
              ) : (
                <SaleTable sales={sales} onView={openDetail} />
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  style={{
                    padding: "18px 28px",
                    borderTop: "1px solid rgba(208,197,175,0.25)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "rgba(245,243,238,0.25)",
                  }}
                >
                  <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)", fontWeight: 500 }}>
                    {t("sales.table.display_info", { from: (page - 1) * pageSize + 1, to: Math.min(page * pageSize, total), total })}
                  </p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="btn-border"
                      onClick={() => handlePageChange(Math.max(1, page - 1))}
                      disabled={page === 1}
                      style={{ opacity: page === 1 ? 0.4 : 1, height: "36px", padding: "0 12px" }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_left</span>
                    </button>
                    <button
                      className="btn-border"
                      onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      style={{ opacity: page === totalPages ? 0.4 : 1, height: "36px", padding: "0 12px" }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <SaleDetailsModal isOpen={isDetailOpen} onClose={closeDetail} sale={detailSale} onRefund={refund} />
    </div>
  );
}