import { useState, useCallback } from "react";
import { useIPC } from "@/hooks/useIPC";
import type { DebtSupplierDetail } from "@/types";
import { toast } from "sonner";

interface UseSupplierDebtDetailsReturn {
  detail: DebtSupplierDetail | null;
  isLoading: boolean;
  load: (supplierId: number) => Promise<void>;
  clear: () => void;
}

export function useSupplierDebtDetails(): UseSupplierDebtDetailsReturn {
  const api = useIPC();
  const [detail, setDetail] = useState<DebtSupplierDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(
    async (supplierId: number) => {
      setIsLoading(true);
      try {
        const result = await api<DebtSupplierDetail>(
          "supplierDebts:getById",
          supplierId
        );
        setDetail(result);
      } catch {
        toast.error("Impossible de charger les détails du fournisseur");
      } finally {
        setIsLoading(false);
      }
    },
    [api]
  );

  const clear = useCallback(() => {
    setDetail(null);
  }, []);

  return { detail, isLoading, load, clear };
}
