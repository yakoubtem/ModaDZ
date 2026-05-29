import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import type { Sale } from "@/types";
import { ReceiptPreview } from "@/modules/pos/components/ReceiptPreview";
import { useReceiptSettings } from "@/modules/pos/hooks/useReceiptSettings";
import { Button } from "@/components/ui/Button";

interface SaleDetailsModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
  onRefund?: (id: number) => Promise<boolean>;
}

export function SaleDetailsModal({ sale, isOpen, onClose, onRefund }: SaleDetailsModalProps) {
  const { settings } = useReceiptSettings();
  const [isRefunding, setIsRefunding] = useState(false);

  if (!sale) return null;

  const handleRefund = async () => {
    if (!confirm("Voulez-vous vraiment rembourser cette vente ? Le stock des articles sera réintégré.")) {
      return;
    }
    setIsRefunding(true);
    if (onRefund) {
      await onRefund(sale.id);
    }
    setIsRefunding(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Détails de la vente ${sale.receiptNumber}`}
      size="sm"
      footer={
        <div className="flex gap-2 w-full">
          <Button variant="secondary" onClick={onClose} className="flex-1" disabled={isRefunding}>
            Fermer
          </Button>
          {sale.status === "completed" && onRefund && (
            <Button
              variant="danger"
              onClick={handleRefund}
              className="flex-1"
              isLoading={isRefunding}
            >
              Rembourser
            </Button>
          )}
        </div>
      }
    >
      <div className="p-1">
        <ReceiptPreview
          sale={sale}
          amountPaid={sale.amountPaid}
          onClose={onClose}
          closeLabel="Fermer"
          hideSuccessBanner={true}
          storeName={settings.storeName}
          storePhone={settings.storePhone}
          storeAddress={settings.storeAddress}
          storeFooter={settings.receiptFooter}
        />
      </div>
    </Modal>
  );
}
