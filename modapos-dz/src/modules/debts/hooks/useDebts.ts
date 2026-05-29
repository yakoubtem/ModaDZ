import { useState, useCallback, useEffect } from "react";
import { useIPC } from "@/hooks/useIPC";
import type {
  CustomerDebtSummary,
  DebtStatistics,
  PaginatedDebtCustomers,
  DebtFilter,
  DebtSort,
} from "@/types";
import { toast } from "sonner";

interface UseDebtsReturn {
  customers: CustomerDebtSummary[];
  stats: DebtStatistics | null;
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  isStatsLoading: boolean;
  search: string;
  filter: DebtFilter;
  sort: DebtSort;

  refresh: () => void;
  handleSearch: (q: string) => void;
  handleFilter: (f: DebtFilter) => void;
  handleSort: (s: DebtSort) => void;
  handlePageChange: (p: number) => void;
}

export function useDebts(): UseDebtsReturn {
  const api = useIPC();

  const [customers, setCustomers] = useState<CustomerDebtSummary[]>([]);
  const [stats, setStats] = useState<DebtStatistics | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<DebtFilter>("all");
  const [sort, setSort] = useState<DebtSort>("debt_desc");
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const loadStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const result = await api<DebtStatistics>("debts:getStatistics");
      setStats(result);
    } catch {
      toast.error("Impossible de charger les statistiques de dettes");
    } finally {
      setIsStatsLoading(false);
    }
  }, [api]);

  const loadPage = useCallback(
    async (p: number, q: string, f: DebtFilter, s: DebtSort) => {
      setIsLoading(true);
      try {
        const result = await api<PaginatedDebtCustomers>("debts:getAll", {
          page: p,
          pageSize,
          search: q || undefined,
          filter: f,
          sort: s,
        });
        setCustomers(result.customers);
        setTotal(result.total);
        setPage(result.page);
      } catch {
        toast.error("Impossible de charger la liste des dettes");
      } finally {
        setIsLoading(false);
      }
    },
    [api, pageSize]
  );

  const refresh = useCallback(
    () => {
      loadPage(page, search, filter, sort);
      loadStats();
    },
    [loadPage, loadStats, page, search, filter, sort]
  );

  useEffect(() => {
    loadPage(1, "", "all", "debt_desc");
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = useCallback(
    (q: string) => {
      setSearch(q);
      if (searchTimer) clearTimeout(searchTimer);
      const t = setTimeout(() => loadPage(1, q, filter, sort), 300);
      setSearchTimer(t);
    },
    [searchTimer, loadPage, filter, sort]
  );

  const handleFilter = useCallback(
    (f: DebtFilter) => {
      setFilter(f);
      loadPage(1, search, f, sort);
    },
    [loadPage, search, sort]
  );

  const handleSort = useCallback(
    (s: DebtSort) => {
      setSort(s);
      loadPage(1, search, filter, s);
    },
    [loadPage, search, filter]
  );

  const handlePageChange = useCallback(
    (p: number) => loadPage(p, search, filter, sort),
    [loadPage, search, filter, sort]
  );

  return {
    customers,
    stats,
    total,
    page,
    pageSize,
    isLoading,
    isStatsLoading,
    search,
    filter,
    sort,
    refresh,
    handleSearch,
    handleFilter,
    handleSort,
    handlePageChange,
  };
}
