import { useState, useCallback, useEffect } from "react";
import { useIPC } from "@/hooks/useIPC";
import { useAuth } from "@/modules/auth/AuthContext";
import type { Purchase, PaginatedPurchases, SupplierWithStats, PaginatedSuppliers, Product } from "@/types";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

export function usePurchases() {
  const { t } = useTranslation();
  const api = useIPC();
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [supplierId, setSupplierId] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<"all" | "paid" | "partial" | "unpaid">("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // Lists for Form selects
  const [suppliers, setSuppliers] = useState<SupplierWithStats[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const loadPage = useCallback(
    async (p: number, q: string, sid: number | undefined, st: typeof status, f: string, tVal: string) => {
      setIsLoading(true);
      try {
        const result = await api<PaginatedPurchases>("purchases:getAll", {
          page: p,
          pageSize,
          search: q || undefined,
          supplierId: sid,
          status: st,
          from: f || undefined,
          to: tVal || undefined,
        });
        setPurchases(result.purchases);
        setTotal(result.total);
        setPage(result.page);
      } catch {
        toast.error(t("purchases.toasts.load_error"));
      } finally {
        setIsLoading(false);
      }
    },
    [api, pageSize, t]
  );

  const loadSummary = useCallback(async () => {
    try {
      const sum = await api("purchases:getSummary");
      setSummary(sum);
    } catch {
      // silent
    }
  }, [api]);

  const refresh = useCallback(
    () => {
      loadPage(page, search, supplierId, status, from, to);
      loadSummary();
    },
    [loadPage, loadSummary, page, search, supplierId, status, from, to]
  );

  useEffect(() => {
    loadPage(1, "", undefined, "all", "", "");
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch form data (suppliers, products) when form opens
  const loadFormData = useCallback(async () => {
    try {
      const [sups, prods] = await Promise.all([
        api<PaginatedSuppliers>("suppliers:getAll", { page: 1, pageSize: 10000 }),
        api<{ products: Product[] }>("products:getAll", { page: 1, pageSize: 10000 }),
      ]);
      setSuppliers(sups.suppliers || []);
      setProducts(prods.products || []);
    } catch {
      // silent
    }
  }, [api]);

  const handleSearch = useCallback(
    (q: string) => {
      setSearch(q);
      loadPage(1, q, supplierId, status, from, to);
    },
    [loadPage, supplierId, status, from, to]
  );

  const handleSupplierFilter = useCallback(
    (sid: number | undefined) => {
      setSupplierId(sid);
      loadPage(1, search, sid, status, from, to);
    },
    [loadPage, search, status, from, to]
  );

  const handleStatusFilter = useCallback(
    (st: typeof status) => {
      setStatus(st);
      loadPage(1, search, supplierId, st, from, to);
    },
    [loadPage, search, supplierId, from, to]
  );

  const handleDateFilter = useCallback(
    (f: string, tVal: string) => {
      setFrom(f);
      setTo(tVal);
      loadPage(1, search, supplierId, status, f, tVal);
    },
    [loadPage, search, supplierId, status]
  );

  const handlePageChange = useCallback(
    (p: number) => loadPage(p, search, supplierId, status, from, to),
    [loadPage, search, supplierId, status, from, to]
  );

  const create = useCallback(
    async (formData: any): Promise<boolean> => {
      try {
        await api("purchases:create", { ...formData, currentUserId: user?.id });
        toast.success(t("purchases.toasts.create_success"));
        refresh();
        return true;
      } catch (err: any) {
        const msg = err?.message || t("purchases.toasts.create_error");
        toast.error(msg);
        return false;
      }
    },
    [api, refresh, user?.id, t]
  );

  const remove = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await api("purchases:delete", id, user?.id);
        toast.success(t("purchases.toasts.delete_success") || "Achat supprimé.");
        refresh();
        return true;
      } catch {
        toast.error(t("purchases.toasts.delete_error") || "Erreur de suppression.");
        return false;
      }
    },
    [api, refresh, user?.id, t]
  );

  const getById = useCallback(
    async (id: number) => {
      return api<Purchase>("purchases:getById", id);
    },
    [api]
  );

  return {
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
    refresh,
    loadFormData,
    handleSearch,
    handleSupplierFilter,
    handleStatusFilter,
    handleDateFilter,
    handlePageChange,
    create,
    remove,
    getById,
  };
}
