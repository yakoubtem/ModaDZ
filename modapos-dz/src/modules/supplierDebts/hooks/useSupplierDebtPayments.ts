import { useState, useCallback } from "react";
import { useIPC } from "@/hooks/useIPC";
import type { AddSupplierPaymentPayload, SupplierPayment } from "@/types";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

interface UseSupplierDebtPaymentsReturn {
  isSubmitting: boolean;
  addPayment: (payload: AddSupplierPaymentPayload) => Promise<boolean>;
  updatePayment: (id: number, payload: { amount: number; method: string; reference?: string; notes?: string; currentUserId: number }) => Promise<boolean>;
  deletePayment: (id: number, currentUserId: number) => Promise<boolean>;
}

export function useSupplierDebtPayments(): UseSupplierDebtPaymentsReturn {
  const api = useIPC();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  const addPayment = useCallback(
    async (payload: AddSupplierPaymentPayload) => {
      setIsSubmitting(true);
      try {
        await api<SupplierPayment>("supplierPayments:create", payload);
        toast.success(t("supplierDebts.payment_modal.success"));
        return true;
      } catch (err: any) {
        toast.error(err.message || "Erreur lors de l'enregistrement du règlement");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [api, t]
  );

  const updatePayment = useCallback(
    async (id: number, payload: { amount: number; method: string; reference?: string; notes?: string; currentUserId: number }) => {
      setIsSubmitting(true);
      try {
        await api<SupplierPayment>("supplierPayments:update", id, payload);
        toast.success("Règlement modifié avec succès");
        return true;
      } catch (err: any) {
        toast.error(err.message || "Erreur lors de la modification du règlement");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [api]
  );

  const deletePayment = useCallback(
    async (id: number, currentUserId: number) => {
      setIsSubmitting(true);
      try {
        await api<boolean>("supplierPayments:delete", id, currentUserId);
        toast.success("Règlement supprimé avec succès");
        return true;
      } catch (err: any) {
        toast.error(err.message || "Erreur lors de la suppression du règlement");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [api]
  );

  return { isSubmitting, addPayment, updatePayment, deletePayment };
}
