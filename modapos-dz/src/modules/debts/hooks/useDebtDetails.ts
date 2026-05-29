import { useState, useCallback } from "react";
import { useIPC } from "@/hooks/useIPC";
import type { DebtCustomerDetail } from "@/types";
import { toast } from "sonner";

interface UseDebtDetailsReturn {
  detail: DebtCustomerDetail | null;
  isLoading: boolean;
  load: (customerId: number) => Promise<void>;
  clear: () => void;
}

export function useDebtDetails(): UseDebtDetailsReturn {
  const api = useIPC();
  const [detail, setDetail] = useState<DebtCustomerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(
    async (customerId: number) => {
      setIsLoading(true);
      try {
        const result = await api<DebtCustomerDetail>(
          "debts:getByCustomer",
          customerId
        );
        setDetail(result);
      } catch {
        toast.error("Impossible de charger les détails de la dette");
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
