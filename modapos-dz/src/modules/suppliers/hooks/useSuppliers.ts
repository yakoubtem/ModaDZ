import { useState, useCallback, useEffect } from "react";
import { useIPC } from "@/hooks/useIPC";
import { useAuth } from "@/modules/auth/AuthContext";
import type { SupplierWithStats, PaginatedSuppliers, SupplierFormData } from "@/types";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

export function useSuppliers() {
  const { t } = useTranslation();
  const api = useIPC();
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<SupplierWithStats[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "debt" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [summary, setSummary] = useState<PaginatedSuppliers["summary"] | undefined>(undefined);
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const loadPage = useCallback(
    async (p: number, q: string, ob: typeof sortBy, oo: typeof sortOrder) => {
      setIsLoading(true);
      try {
        const result = await api<PaginatedSuppliers>("suppliers:getAll", {
          page: p,
          pageSize,
          search: q || undefined,
          sortBy: ob,
          sortOrder: oo,
        });
        setSuppliers(result.suppliers);
        setTotal(result.total);
        setPage(result.page);
        setSummary(result.summary);
      } catch {
        toast.error(t("suppliers.toasts.load_error"));
      } finally {
        setIsLoading(false);
      }
    },
    [api, pageSize, t]
  );

  const refresh = useCallback(
    () => loadPage(page, search, sortBy, sortOrder),
    [loadPage, page, search, sortBy, sortOrder]
  );

  useEffect(() => {
    loadPage(1, "", "createdAt", "desc");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = useCallback(
    (q: string) => {
      setSearch(q);
      if (searchTimer) clearTimeout(searchTimer);
      const timer = setTimeout(() => loadPage(1, q, sortBy, sortOrder), 300);
      setSearchTimer(timer);
    },
    [searchTimer, loadPage, sortBy, sortOrder]
  );

  const handlePageChange = useCallback(
    (p: number) => loadPage(p, search, sortBy, sortOrder),
    [loadPage, search, sortBy, sortOrder]
  );

  const handleSort = useCallback(
    (field: typeof sortBy) => {
      const isAsc = sortBy === field && sortOrder === "asc";
      const nextOrder = isAsc ? "desc" : "asc";
      setSortBy(field);
      setSortOrder(nextOrder);
      loadPage(1, search, field, nextOrder);
    },
    [loadPage, search, sortBy, sortOrder]
  );

  const create = useCallback(
    async (data: SupplierFormData): Promise<boolean> => {
      try {
        await api("suppliers:create", { ...data, currentUserId: user?.id });
        toast.success(t("suppliers.toasts.create_success"));
        refresh();
        return true;
      } catch {
        toast.error(t("suppliers.toasts.create_error"));
        return false;
      }
    },
    [api, refresh, user?.id, t]
  );

  const update = useCallback(
    async (id: number, data: SupplierFormData): Promise<boolean> => {
      try {
        await api("suppliers:update", id, { ...data, currentUserId: user?.id });
        toast.success(t("suppliers.toasts.update_success"));
        refresh();
        return true;
      } catch {
        toast.error(t("suppliers.toasts.update_error"));
        return false;
      }
    },
    [api, refresh, user?.id, t]
  );

  const remove = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await api("suppliers:delete", id, user?.id);
        toast.success(t("suppliers.toasts.delete_success"));
        refresh();
        return true;
      } catch (err: any) {
        const msg = err?.message || t("suppliers.toasts.delete_error");
        toast.error(msg);
        return false;
      }
    },
    [api, refresh, user?.id, t]
  );

  return {
    suppliers,
    total,
    page,
    pageSize,
    isLoading,
    search,
    sortBy,
    sortOrder,
    summary,
    refresh,
    handleSearch,
    handlePageChange,
    handleSort,
    create,
    update,
    remove,
  };
}
