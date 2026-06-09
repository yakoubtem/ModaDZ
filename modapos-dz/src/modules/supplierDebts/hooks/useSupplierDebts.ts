import { useState, useCallback, useEffect } from "react";
import { useIPC } from "@/hooks/useIPC";
import type {
  SupplierDebtSummary,
  SupplierDebtStatistics,
  PaginatedSupplierDebts,
  SupplierDebtFilter,
  SupplierDebtSort,
} from "@/types";
import { toast } from "sonner";

interface UseSupplierDebtsReturn {
  suppliers: SupplierDebtSummary[];
  stats: SupplierDebtStatistics | null;
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  isStatsLoading: boolean;
  search: string;
  filter: SupplierDebtFilter;
  sort: SupplierDebtSort;
  fromDate: string;
  toDate: string;
  minAmount: string;
  maxAmount: string;

  refresh: () => void;
  handleSearch: (q: string) => void;
  handleFilter: (f: SupplierDebtFilter) => void;
  handleSort: (s: SupplierDebtSort) => void;
  handlePageChange: (p: number) => void;
  handleDateRange: (from: string, to: string) => void;
  handleAmountRange: (min: string, max: string) => void;
  handleResetFilters: () => void;
}

export function useSupplierDebts(): UseSupplierDebtsReturn {
  const api = useIPC();

  const [suppliers, setSuppliers] = useState<SupplierDebtSummary[]>([]);
  const [stats, setStats] = useState<SupplierDebtStatistics | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<SupplierDebtFilter>("all");
  const [sort, setSort] = useState<SupplierDebtSort>("debt_desc");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const loadStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const result = await api<SupplierDebtStatistics>("supplierDebts:getStatistics");
      setStats(result);
    } catch {
      toast.error("Impossible de charger les statistiques de dettes fournisseurs");
    } finally {
      setIsStatsLoading(false);
    }
  }, [api]);

  const loadPage = useCallback(
    async (
      p: number,
      q: string,
      f: SupplierDebtFilter,
      s: SupplierDebtSort,
      fd: string,
      td: string,
      min: string,
      max: string
    ) => {
      setIsLoading(true);
      try {
        const result = await api<PaginatedSupplierDebts>("supplierDebts:getAll", {
          page: p,
          pageSize,
          search: q || undefined,
          filter: f,
          sort: s,
          fromDate: fd || undefined,
          toDate: td || undefined,
          minAmount: min ? parseFloat(min) : undefined,
          maxAmount: max ? parseFloat(max) : undefined,
        });
        setSuppliers(result.suppliers);
        setTotal(result.total);
        setPage(result.page);
      } catch {
        toast.error("Impossible de charger la liste des dettes fournisseurs");
      } finally {
        setIsLoading(false);
      }
    },
    [api, pageSize]
  );

  const refresh = useCallback(
    () => {
      loadPage(page, search, filter, sort, fromDate, toDate, minAmount, maxAmount);
      loadStats();
    },
    [loadPage, loadStats, page, search, filter, sort, fromDate, toDate, minAmount, maxAmount]
  );

  useEffect(() => {
    loadPage(1, "", "all", "debt_desc", "", "", "", "");
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = useCallback(
    (q: string) => {
      setSearch(q);
      if (searchTimer) clearTimeout(searchTimer);
      const t = setTimeout(() => loadPage(1, q, filter, sort, fromDate, toDate, minAmount, maxAmount), 300);
      setSearchTimer(t);
    },
    [searchTimer, loadPage, filter, sort, fromDate, toDate, minAmount, maxAmount]
  );

  const handleFilter = useCallback(
    (f: SupplierDebtFilter) => {
      setFilter(f);
      loadPage(1, search, f, sort, fromDate, toDate, minAmount, maxAmount);
    },
    [loadPage, search, sort, fromDate, toDate, minAmount, maxAmount]
  );

  const handleSort = useCallback(
    (s: SupplierDebtSort) => {
      setSort(s);
      loadPage(1, search, filter, s, fromDate, toDate, minAmount, maxAmount);
    },
    [loadPage, search, filter, fromDate, toDate, minAmount, maxAmount]
  );

  const handlePageChange = useCallback(
    (p: number) => loadPage(p, search, filter, sort, fromDate, toDate, minAmount, maxAmount),
    [loadPage, search, filter, sort, fromDate, toDate, minAmount, maxAmount]
  );

  const handleDateRange = useCallback(
    (from: string, to: string) => {
      setFromDate(from);
      setToDate(to);
      loadPage(1, search, filter, sort, from, to, minAmount, maxAmount);
    },
    [loadPage, search, filter, sort, minAmount, maxAmount]
  );

  const handleAmountRange = useCallback(
    (min: string, max: string) => {
      setMinAmount(min);
      setMaxAmount(max);
      loadPage(1, search, filter, sort, fromDate, toDate, min, max);
    },
    [loadPage, search, filter, sort, fromDate, toDate]
  );

  const handleResetFilters = useCallback(() => {
    setSearch("");
    setFilter("all");
    setSort("debt_desc");
    setFromDate("");
    setToDate("");
    setMinAmount("");
    setMaxAmount("");
    loadPage(1, "", "all", "debt_desc", "", "", "", "");
  }, [loadPage]);

  return {
    suppliers,
    stats,
    total,
    page,
    pageSize,
    isLoading,
    isStatsLoading,
    search,
    filter,
    sort,
    fromDate,
    toDate,
    minAmount,
    maxAmount,
    refresh,
    handleSearch,
    handleFilter,
    handleSort,
    handlePageChange,
    handleDateRange,
    handleAmountRange,
    handleResetFilters,
  };
}
