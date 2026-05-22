import { PageHeader, PageContent } from "@/components/layout/AppLayout";
import { useSalesHistory } from "./hooks/useSalesHistory";
import { SaleTable } from "./components/SaleTable";
import { SaleFilters as SaleFiltersComponent } from "./components/SaleFilters";
import { SaleDetailsModal } from "./components/SaleDetailsModal";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

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
  } = useSalesHistory();

  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <PageHeader title="Historique des ventes" description="Toutes les transactions" />
      <PageContent>
        <div className="flex flex-col gap-6">
          <SaleFiltersComponent
            filters={filters}
            onChange={setFilters}
            onReset={resetFilters}
            total={total}
          />
          
          <div className="flex-1 min-h-0 rounded-lg flex flex-col gap-4">
            {isLoading && sales.length === 0 ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <SaleTable sales={sales} onView={openDetail} />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center bg-[var(--color-bg-elevated)] p-4 border border-[var(--color-border)] rounded-lg mt-2">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Affichage de {(page - 1) * pageSize + 1} à{" "}
                  {Math.min(page * pageSize, total)} sur {total} ventes
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageContent>
      
      <SaleDetailsModal
        isOpen={isDetailOpen}
        onClose={closeDetail}
        sale={detailSale}
      />
    </>
  );
}