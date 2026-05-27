import { Modal } from "@/components/ui/Modal";
import type { Sale } from "@/types";
import { ReceiptPreview } from "@/modules/pos/components/ReceiptPreview";
import { useReceiptSettings } from "@/modules/pos/hooks/useReceiptSettings";

interface SaleDetailsModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SaleDetailsModal({ sale, isOpen, onClose }: SaleDetailsModalProps) {
  const { settings } = useReceiptSettings();

  if (!sale) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Détails de la vente ${sale.receiptNumber}`}
      size="sm"
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