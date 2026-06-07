import { useState, useCallback, useEffect } from "react";
import { useIPC } from "@/hooks/useIPC";
import type {
  CustomerWithStats,
  CustomerDetail,
  PaginatedCustomers,
} from "@/types";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

interface UseCustomersReturn {
  customers: CustomerWithStats[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  search: string;
  selectedCustomer: CustomerDetail | null;
  isProfileOpen: boolean;

  // Actions
  refresh: () => void;
  handleSearch: (q: string) => void;
  handlePageChange: (p: number) => void;
  openProfile: (id: number) => Promise<void>;
  closeProfile: () => void;
  create: (data: { name: string; phone?: string; email?: string; notes?: string }) => Promise<boolean>;
  update: (id: number, data: { name?: string; phone?: string; email?: string; notes?: string }) => Promise<boolean>;
  remove: (id: number) => Promise<boolean>;
}

export function useCustomers(): UseCustomersReturn {
  const { t } = useTranslation();
  const api = useIPC();
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const loadPage = useCallback(
    async (p: number, q: string) => {
      setIsLoading(true);
      try {
        const result = await api<PaginatedCustomers>("customers:getAll", {
          page: p,
          pageSize,
          search: q || undefined,
        });
        setCustomers(result.customers);
        setTotal(result.total);
        setPage(result.page);
      } catch {
        toast.error(t("customers.toasts.load_error"));
      } finally {
        setIsLoading(false);
      }
    },
    [api, pageSize, t]
  );

  const refresh = useCallback(() => loadPage(page, search), [loadPage, page, search]);

  useEffect(() => {
    loadPage(1, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = useCallback(
    (q: string) => {
      setSearch(q);
      if (searchTimer) clearTimeout(searchTimer);
      const t = setTimeout(() => loadPage(1, q), 300);
      setSearchTimer(t);
    },
    [searchTimer, loadPage]
  );

  const handlePageChange = useCallback(
    (p: number) => loadPage(p, search),
    [loadPage, search]
  );

  const openProfile = useCallback(
    async (id: number) => {
      try {
        const detail = await api<CustomerDetail>("customers:getById", id);
        if (detail) {
          setSelectedCustomer(detail);
          setIsProfileOpen(true);
        }
      } catch {
        toast.error(t("customers.toasts.profile_error"));
      }
    },
    [api, t]
  );

  const closeProfile = useCallback(() => {
    setIsProfileOpen(false);
    setSelectedCustomer(null);
  }, []);

  const create = useCallback(
    async (data: { name: string; phone?: string; email?: string; notes?: string }): Promise<boolean> => {
      try {
        await api("customers:create", data);
        toast.success(t("customers.toasts.create_success"));
        refresh();
        return true;
      } catch {
        toast.error(t("customers.toasts.create_error"));
        return false;
      }
    },
    [api, refresh, t]
  );

  const update = useCallback(
    async (id: number, data: { name?: string; phone?: string; email?: string; notes?: string }): Promise<boolean> => {
      try {
        await api("customers:update", id, data);
        toast.success(t("customers.toasts.update_success"));
        refresh();
        return true;
      } catch {
        toast.error(t("customers.toasts.update_error"));
        return false;
      }
    },
    [api, refresh, t]
  );

  const remove = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await api("customers:delete", id);
        toast.success(t("customers.toasts.delete_success"));
        refresh();
        return true;
      } catch {
        toast.error(t("customers.toasts.delete_error"));
        return false;
      }
    },
    [api, refresh, t]
  );

  return {
    customers,
    total,
    page,
    pageSize,
    isLoading,
    search,
    selectedCustomer,
    isProfileOpen,
    refresh,
    handleSearch,
    handlePageChange,
    openProfile,
    closeProfile,
    create,
    update,
    remove,
  };
}
