import { useState, useCallback, useEffect } from "react";
import { useIPC } from "@/hooks/useIPC";
import type {
  Expense,
  ExpenseFormData,
  ExpenseSummary,
  ExpenseSort,
  PaginatedExpenses,
} from "@/types";
import { toast } from "sonner";

interface UseExpensesReturn {
  expenses: Expense[];
  summary: ExpenseSummary | null;
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  isSummaryLoading: boolean;

  // Filter state
  search: string;
  category: string;
  from: string;
  to: string;
  minAmount: string;
  maxAmount: string;
  sort: ExpenseSort;

  // Actions
  refresh: () => void;
  handleSearch: (q: string) => void;
  handleCategory: (c: string) => void;
  handleDateRange: (from: string, to: string) => void;
  handleAmountRange: (min: string, max: string) => void;
  handleSort: (s: ExpenseSort) => void;
  handlePageChange: (p: number) => void;
  resetFilters: () => void;

  // CRUD
  createExpense: (data: ExpenseFormData) => Promise<boolean>;
  updateExpense: (id: number, data: ExpenseFormData) => Promise<boolean>;
  deleteExpense: (id: number) => Promise<boolean>;
}

export function useExpenses(): UseExpensesReturn {
  const api = useIPC();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [sort, setSort] = useState<ExpenseSort>("newest");
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const loadSummary = useCallback(async () => {
    setIsSummaryLoading(true);
    try {
      const result = await api<ExpenseSummary>("expenses:getSummary");
      setSummary(result);
    } catch {
      toast.error("Impossible de charger le résumé des dépenses");
    } finally {
      setIsSummaryLoading(false);
    }
  }, [api]);

  const loadPage = useCallback(
    async (
      p: number,
      q: string,
      cat: string,
      dateFrom: string,
      dateTo: string,
      amtMin: string,
      amtMax: string,
      s: ExpenseSort
    ) => {
      setIsLoading(true);
      try {
        const result = await api<PaginatedExpenses>("expenses:getAll", {
          page: p,
          pageSize,
          search: q || undefined,
          category: cat || undefined,
          from: dateFrom || undefined,
          to: dateTo || undefined,
          minAmount: amtMin ? parseFloat(amtMin) : undefined,
          maxAmount: amtMax ? parseFloat(amtMax) : undefined,
          sort: s,
        });
        setExpenses(result.expenses);
        setTotal(result.total);
        setPage(result.page);
      } catch {
        toast.error("Impossible de charger les dépenses");
      } finally {
        setIsLoading(false);
      }
    },
    [api, pageSize]
  );

  const refresh = useCallback(() => {
    loadPage(page, search, category, from, to, minAmount, maxAmount, sort);
    loadSummary();
  }, [loadPage, loadSummary, page, search, category, from, to, minAmount, maxAmount, sort]);

  useEffect(() => {
    loadPage(1, "", "", "", "", "", "", "newest");
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = useCallback(
    (q: string) => {
      setSearch(q);
      if (searchTimer) clearTimeout(searchTimer);
      const t = setTimeout(() => loadPage(1, q, category, from, to, minAmount, maxAmount, sort), 300);
      setSearchTimer(t);
    },
    [searchTimer, loadPage, category, from, to, minAmount, maxAmount, sort]
  );

  const handleCategory = useCallback(
    (c: string) => {
      setCategory(c);
      loadPage(1, search, c, from, to, minAmount, maxAmount, sort);
    },
    [loadPage, search, from, to, minAmount, maxAmount, sort]
  );

  const handleDateRange = useCallback(
    (newFrom: string, newTo: string) => {
      setFrom(newFrom);
      setTo(newTo);
      loadPage(1, search, category, newFrom, newTo, minAmount, maxAmount, sort);
    },
    [loadPage, search, category, minAmount, maxAmount, sort]
  );

  const handleAmountRange = useCallback(
    (min: string, max: string) => {
      setMinAmount(min);
      setMaxAmount(max);
      loadPage(1, search, category, from, to, min, max, sort);
    },
    [loadPage, search, category, from, to, sort]
  );

  const handleSort = useCallback(
    (s: ExpenseSort) => {
      setSort(s);
      loadPage(1, search, category, from, to, minAmount, maxAmount, s);
    },
    [loadPage, search, category, from, to, minAmount, maxAmount]
  );

  const handlePageChange = useCallback(
    (p: number) => loadPage(p, search, category, from, to, minAmount, maxAmount, sort),
    [loadPage, search, category, from, to, minAmount, maxAmount, sort]
  );

  const resetFilters = useCallback(() => {
    setSearch("");
    setCategory("");
    setFrom("");
    setTo("");
    setMinAmount("");
    setMaxAmount("");
    setSort("newest");
    loadPage(1, "", "", "", "", "", "", "newest");
  }, [loadPage]);

  const createExpense = useCallback(
    async (data: ExpenseFormData): Promise<boolean> => {
      try {
        await api("expenses:create", data);
        toast.success("Dépense créée avec succès");
        refresh();
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur lors de la création");
        return false;
      }
    },
    [api, refresh]
  );

  const updateExpense = useCallback(
    async (id: number, data: ExpenseFormData): Promise<boolean> => {
      try {
        await api("expenses:update", { id, ...data });
        toast.success("Dépense modifiée avec succès");
        refresh();
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur lors de la modification");
        return false;
      }
    },
    [api, refresh]
  );

  const deleteExpense = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await api("expenses:delete", id);
        toast.success("Dépense supprimée");
        refresh();
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur lors de la suppression");
        return false;
      }
    },
    [api, refresh]
  );

  return {
    expenses,
    summary,
    total,
    page,
    pageSize,
    isLoading,
    isSummaryLoading,
    search,
    category,
    from,
    to,
    minAmount,
    maxAmount,
    sort,
    refresh,
    handleSearch,
    handleCategory,
    handleDateRange,
    handleAmountRange,
    handleSort,
    handlePageChange,
    resetFilters,
    createExpense,
    updateExpense,
    deleteExpense,
  };
}
