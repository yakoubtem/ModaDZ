import { useState, useCallback } from "react";
import { useIPC } from "@/hooks/useIPC";
import type { AddPaymentPayload, DebtPayment } from "@/types";
import { toast } from "sonner";

interface UseDebtPaymentsReturn {
  isSubmitting: boolean;
  addPayment: (
    payload: AddPaymentPayload,
    onSuccess?: () => void
  ) => Promise<boolean>;
}

export function useDebtPayments(): UseDebtPaymentsReturn {
  const api = useIPC();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addPayment = useCallback(
    async (
      payload: AddPaymentPayload,
      onSuccess?: () => void
    ): Promise<boolean> => {
      if (payload.amount <= 0) {
        toast.error("Le montant doit être supérieur à 0");
        return false;
      }
      setIsSubmitting(true);
      try {
        await api<DebtPayment>("debts:addPayment", payload);
        toast.success(
          `Paiement de ${new Intl.NumberFormat("fr-DZ", {
            style: "currency",
            currency: "DZD",
            minimumFractionDigits: 0,
          }).format(payload.amount)} enregistré`
        );
        onSuccess?.();
        return true;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Erreur lors du paiement";
        toast.error(msg);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [api]
  );

  return { isSubmitting, addPayment };
}
