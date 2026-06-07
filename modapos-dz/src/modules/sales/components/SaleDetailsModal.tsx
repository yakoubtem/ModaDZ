import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import type { Sale } from "@/types";
import { ReceiptPreview } from "@/modules/pos/components/ReceiptPreview";
import { useReceiptSettings } from "@/modules/pos/hooks/useReceiptSettings";
import { Button } from "@/components/ui/Button";
import { PaymentStatusBadge } from "@/components/ui/PaymentStatusBadge";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/modules/auth/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";

interface SaleDetailsModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
  onRefund?: (id: number) => Promise<boolean>;
}

export function SaleDetailsModal({ sale, isOpen, onClose, onRefund }: SaleDetailsModalProps) {
  const { t } = useTranslation();
  const { settings } = useReceiptSettings();
  const { can } = useAuth();
  const [isRefunding, setIsRefunding] = useState(false);

  if (!sale) return null;

  const handleRefund = async () => {
    if (!confirm(t("sales.details.confirm_refund"))) {
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
      title={t("sales.details.title_number", { number: sale.receiptNumber || "" })}
      size="md"
      footer={
        <div className="flex gap-2 w-full">
          <Button variant="secondary" onClick={onClose} className="flex-1" disabled={isRefunding}>
            {t("common.buttons.close")}
          </Button>
          {sale.status === "completed" && onRefund && can("sales.refund") && (
            <Button
              variant="danger"
              onClick={handleRefund}
              className="flex-1"
              isLoading={isRefunding}
            >
              {t("sales.details.refund_btn")}
            </Button>
          )}
        </div>
      }
    >
      <div className="p-1">
        {/* ── Payment / Sale status row ── */}
        <div className="flex items-center gap-4 mb-4 px-1 flex-wrap">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
              {t("sales.details.status_sale")}
            </span>
            {sale.status === "completed" ? (
              <Badge variant="success">✓ {t("common.status.completed")}</Badge>
            ) : sale.status === "refunded" ? (
              <Badge variant="danger">{t("common.status.refunded")}</Badge>
            ) : (
              <Badge variant="default">{sale.status}</Badge>
            )}
          </div>
          <div className="w-px h-8 bg-[var(--color-border)]" />
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
              {t("sales.details.status_payment")}
            </span>
            <PaymentStatusBadge amountPaid={sale.amountPaid} total={sale.total} />
          </div>
        </div>

        <ReceiptPreview
          sale={sale}
          amountPaid={sale.amountPaid}
          onClose={onClose}
          closeLabel={t("common.buttons.close")}
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
