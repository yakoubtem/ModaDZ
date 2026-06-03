import { useState, useCallback, useEffect } from "react";
import { useIPC } from "@/hooks/useIPC";
import type {
  Expense,
  ExpenseAnalytics,
  ExpenseCategoryRecord,
  ExpenseFormData,
  ExpenseSummary,
  ExpenseSort,
  PaginatedExpenses,
} from "@/types";
import { toast } from "sonner";

interface UseExpensesReturn {
  expenses: Expense[];
  summary: ExpenseSummary | null;
  analytics: ExpenseAnalytics | null;
  categories: ExpenseCategoryRecord[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  isSummaryLoading: boolean;
  isAnalyticsLoading: boolean;
  isCategoriesLoading: boolean;

  // Filter state
  search: string;
  category: string;
  supplier: string;
  paymentMethod: string;
  from: string;
  to: string;
  minAmount: string;
  maxAmount: string;
  sort: ExpenseSort;

  // Actions
  refresh: () => void;
  handleSearch: (q: string) => void;
  handleCategory: (c: string) => void;
  handleSupplier: (s: string) => void;
  handlePaymentMethod: (m: string) => void;
  handleDateRange: (from: string, to: string) => void;
  handleAmountRange: (min: string, max: string) => void;
  handleSort: (s: ExpenseSort) => void;
  handlePageChange: (p: number) => void;
  resetFilters: () => void;

  // Categories
  loadCategories: () => void;
  createCategory: (name: string) => Promise<boolean>;
  updateCategory: (id: number, name: string, isArchived?: boolean) => Promise<boolean>;
  archiveCategory: (id: number, archive: boolean) => Promise<boolean>;

  // Reports
  getReportData: () => Promise<{ expenses: Expense[]; total: number } | null>;

  // CRUD
  createExpense: (data: ExpenseFormData) => Promise<boolean>;
  updateExpense: (id: number, data: ExpenseFormData) => Promise<boolean>;
  deleteExpense: (id: number) => Promise<boolean>;
}

export function useExpenses(): UseExpensesReturn {
  const api = useIPC();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [analytics, setAnalytics] = useState<ExpenseAnalytics | null>(null);
  const [categories, setCategories] = useState<ExpenseCategoryRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [supplier, setSupplier] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
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

  const loadAnalytics = useCallback(
    async (params?: {
      from?: string;
      to?: string;
      category?: string;
      supplier?: string;
      paymentMethod?: string;
      search?: string;
      minAmount?: string;
      maxAmount?: string;
    }) => {
      setIsAnalyticsLoading(true);
      try {
        const result = await api<ExpenseAnalytics>("expenses:getAnalytics", {
          from: (params?.from ?? from) || undefined,
          to: (params?.to ?? to) || undefined,
          category: (params?.category ?? category) || undefined,
          supplier: (params?.supplier ?? supplier) || undefined,
          paymentMethod: (params?.paymentMethod ?? paymentMethod) || undefined,
          search: (params?.search ?? search) || undefined,
          minAmount: params?.minAmount ? parseFloat(params.minAmount) : minAmount ? parseFloat(minAmount) : undefined,
          maxAmount: params?.maxAmount ? parseFloat(params.maxAmount) : maxAmount ? parseFloat(maxAmount) : undefined,
        });
        setAnalytics(result);
      } catch {
        toast.error("Impossible de charger les analyses");
      } finally {
        setIsAnalyticsLoading(false);
      }
    },
    [api, from, to, category, supplier, paymentMethod, search, minAmount, maxAmount]
  );

  const loadCategories = useCallback(async () => {
    setIsCategoriesLoading(true);
    try {
      const result = await api<ExpenseCategoryRecord[]>("expenses:getCategories");
      setCategories(result);
    } catch {
      toast.error("Impossible de charger les catégories");
    } finally {
      setIsCategoriesLoading(false);
    }
  }, [api]);

  const loadPage = useCallback(
    async (
      p: number,
      q: string,
      cat: string,
      supp: string,
      pay: string,
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
          supplier: supp || undefined,
          paymentMethod: pay || undefined,
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
    loadPage(page, search, category, supplier, paymentMethod, from, to, minAmount, maxAmount, sort);
    loadSummary();
    loadAnalytics();
    loadCategories();
  }, [loadPage, loadSummary, loadAnalytics, loadCategories, page, search, category, from, to, minAmount, maxAmount, sort]);

  useEffect(() => {
    loadPage(1, "", "", "", "", "", "", "", "", "newest");
    loadSummary();
    loadAnalytics();
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = useCallback(
    (q: string) => {
      setSearch(q);
      if (searchTimer) clearTimeout(searchTimer);
      const t = setTimeout(() => {
        loadPage(1, q, category, supplier, paymentMethod, from, to, minAmount, maxAmount, sort);
        loadAnalytics({ search: q });
      }, 300);
      setSearchTimer(t);
    },
    [searchTimer, loadPage, loadAnalytics, category, from, to, minAmount, maxAmount, sort]
  );

  const handleCategory = useCallback(
    (c: string) => {
      setCategory(c);
      loadPage(1, search, c, supplier, paymentMethod, from, to, minAmount, maxAmount, sort);
      loadAnalytics({ category: c });
    },
    [loadPage, loadAnalytics, search, from, to, minAmount, maxAmount, sort]
  );

  const handleSupplier = useCallback(
    (s: string) => {
      setSupplier(s);
      loadPage(1, search, category, s, paymentMethod, from, to, minAmount, maxAmount, sort);
      loadAnalytics({ supplier: s });
    },
    [loadPage, loadAnalytics, search, category, from, to, minAmount, maxAmount, sort]
  );

  const handlePaymentMethod = useCallback(
    (m: string) => {
      setPaymentMethod(m);
      loadPage(1, search, category, supplier, m, from, to, minAmount, maxAmount, sort);
      loadAnalytics({ paymentMethod: m });
    },
    [loadPage, loadAnalytics, search, category, from, to, minAmount, maxAmount, sort]
  );

  const handleDateRange = useCallback(
    (newFrom: string, newTo: string) => {
      setFrom(newFrom);
      setTo(newTo);
      loadPage(1, search, category, supplier, paymentMethod, newFrom, newTo, minAmount, maxAmount, sort);
      loadAnalytics({ from: newFrom, to: newTo });
    },
    [loadPage, loadAnalytics, search, category, minAmount, maxAmount, sort]
  );

  const handleAmountRange = useCallback(
    (min: string, max: string) => {
      setMinAmount(min);
      setMaxAmount(max);
      loadPage(1, search, category, supplier, paymentMethod, from, to, min, max, sort);
      loadAnalytics({ minAmount: min, maxAmount: max });
    },
    [loadPage, loadAnalytics, search, category, from, to, sort]
  );

  const handleSort = useCallback(
    (s: ExpenseSort) => {
      setSort(s);
      loadPage(1, search, category, supplier, paymentMethod, from, to, minAmount, maxAmount, s);
    },
    [loadPage, search, category, from, to, minAmount, maxAmount]
  );

  const handlePageChange = useCallback(
    (p: number) => loadPage(p, search, category, supplier, paymentMethod, from, to, minAmount, maxAmount, sort),
    [loadPage, search, category, supplier, paymentMethod, from, to, minAmount, maxAmount, sort]
  );

  const resetFilters = useCallback(() => {
    setSearch("");
    setCategory("");
    setSupplier("");
    setPaymentMethod("");
    setFrom("");
    setTo("");
    setMinAmount("");
    setMaxAmount("");
    setSort("newest");
    loadPage(1, "", "", "", "", "", "", "", "", "newest");
    loadAnalytics({ from: "", to: "", category: "", supplier: "", paymentMethod: "", search: "", minAmount: "", maxAmount: "" });
  }, [loadPage]);

  const createCategory = useCallback(
    async (name: string): Promise<boolean> => {
      try {
        await api("expenses:createCategory", { name });
        toast.success("Catégorie ajoutée");
        loadCategories();
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur lors de la création");
        return false;
      }
    },
    [api, loadCategories]
  );

  const updateCategory = useCallback(
    async (id: number, name: string, isArchived?: boolean): Promise<boolean> => {
      try {
        await api("expenses:updateCategory", { id, name, isArchived });
        toast.success("Catégorie mise à jour");
        loadCategories();
        refresh();
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur lors de la modification");
        return false;
      }
    },
    [api, loadCategories, refresh]
  );

  const archiveCategory = useCallback(
    async (id: number, archive: boolean): Promise<boolean> => {
      try {
        await api("expenses:archiveCategory", { id, archive });
        toast.success(archive ? "Catégorie archivée" : "Catégorie réactivée");
        loadCategories();
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur lors de la modification");
        return false;
      }
    },
    [api, loadCategories]
  );

  const getReportData = useCallback(async () => {
    try {
      const result = await api<{ expenses: Expense[]; total: number }>("expenses:getReport", {
        search: search || undefined,
        category: category || undefined,
        supplier: supplier || undefined,
        paymentMethod: paymentMethod || undefined,
        from: from || undefined,
        to: to || undefined,
        minAmount: minAmount ? parseFloat(minAmount) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
        sort,
      });
      return result;
    } catch {
      toast.error("Impossible de générer le rapport");
      return null;
    }
  }, [api, search, category, supplier, paymentMethod, from, to, minAmount, maxAmount, sort]);

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
    analytics,
    categories,
    total,
    page,
    pageSize,
    isLoading,
    isSummaryLoading,
    isAnalyticsLoading,
    isCategoriesLoading,
    search,
    category,
    supplier,
    paymentMethod,
    from,
    to,
    minAmount,
    maxAmount,
    sort,
    refresh,
    handleSearch,
    handleCategory,
    handleSupplier,
    handlePaymentMethod,
    handleDateRange,
    handleAmountRange,
    handleSort,
    handlePageChange,
    resetFilters,
    loadCategories,
    createCategory,
    updateCategory,
    archiveCategory,
    getReportData,
    createExpense,
    updateExpense,
    deleteExpense,
  };
}
