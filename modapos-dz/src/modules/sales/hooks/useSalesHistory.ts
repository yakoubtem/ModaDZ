import { useState, useCallback, useEffect } from "react";
import { useIPC } from "@/hooks/useIPC";
import type { PaginatedSales, SalesFilters, Sale } from "@/types";
import { toast } from "sonner";

const DEFAULT_FILTERS: SalesFilters = {
  search: "",
  paymentMethod: "",
  status: "",
  from: "",
  to: "",
};

interface UseSalesHistoryReturn {
  sales: PaginatedSales["sales"];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  filters: SalesFilters;
  detailSale: Sale | null;
  isDetailOpen: boolean;

  setFilters: (f: Partial<SalesFilters>) => void;
  resetFilters: () => void;
  handlePageChange: (p: number) => void;
  openDetail: (id: number) => Promise<void>;
  closeDetail: () => void;
}

export function useSalesHistory(): UseSalesHistoryReturn {
  const api = useIPC();
  const [sales, setSales] = useState<PaginatedSales["sales"]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFiltersState] = useState<SalesFilters>(DEFAULT_FILTERS);

  const [detailSale, setDetailSale] = useState<Sale | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Debounce ref for search field
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const loadPage = useCallback(
    async (p: number, f: SalesFilters) => {
      setIsLoading(true);
      try {
        const result = await api<PaginatedSales>("sales:getAll", {
          page: p,
          pageSize,
          search: f.search.trim() || undefined,
          paymentMethod: f.paymentMethod || undefined,
          status: f.status || undefined,
          from: f.from || undefined,
          to: f.to ? `${f.to}T23:59:59` : undefined,
        });
        setSales(result.sales);
        setTotal(result.total);
        setPage(result.page);
      } catch {
        toast.error("Impossible de charger les ventes");
      } finally {
        setIsLoading(false);
      }
    },
    [api, pageSize]
  );

  useEffect(() => {
    loadPage(1, DEFAULT_FILTERS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setFilters = useCallback(
    (partial: Partial<SalesFilters>) => {
      setFiltersState((prev) => {
        const next = { ...prev, ...partial };

        // Debounce search text changes
        if ("search" in partial) {
          if (searchTimer) clearTimeout(searchTimer);
          const t = setTimeout(() => loadPage(1, next), 350);
          setSearchTimer(t);
        } else {
          loadPage(1, next);
        }

        return next;
      });
    },
    [loadPage, searchTimer]
  );

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    loadPage(1, DEFAULT_FILTERS);
  }, [loadPage]);

  const handlePageChange = useCallback(
    (p: number) => loadPage(p, filters),
    [loadPage, filters]
  );

  const openDetail = useCallback(
    async (id: number) => {
      try {
        const sale = await api<Sale>("sales:getById", id);
        if (sale) {
          setDetailSale(sale);
          setIsDetailOpen(true);
        }
      } catch {
        toast.error("Impossible de charger les détails");
      }
    },
    [api]
  );

  const closeDetail = useCallback(() => {
    setIsDetailOpen(false);
    setDetailSale(null);
  }, []);

  return {
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
  };
}
