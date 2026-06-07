import { useState } from "react";
import {
  Phone,
  Mail,
  FileText,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  Pencil,
  Receipt,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PaymentStatusBadge } from "@/components/ui/PaymentStatusBadge";
import type { CustomerDetail, Sale } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

// ─── Stat card ────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  highlight = false,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-[var(--radius-lg)] border shadow-[var(--shadow-sm)]",
        highlight
          ? "border-[var(--color-danger)]/30 bg-[var(--color-danger-subtle)]"
          : "border-[var(--color-border)] bg-[var(--color-bg-surface)]"
      )}
    >
      <div
        className={cn(
          "w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center shrink-0",
          highlight
            ? "bg-[var(--color-danger)]/20 text-[var(--color-danger)]"
            : "bg-[var(--color-accent-subtle)] text-[var(--color-accent)]"
        )}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-sm font-bold text-[var(--color-text-primary)] tabular-nums">
          {value}
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
      </div>
    </div>
  );
}

interface CustomerProfileModalProps {
  customer: CustomerDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export function CustomerProfileModal({
  customer,
  isOpen,
  onClose,
  onEdit,
}: CustomerProfileModalProps) {
  const { t, isRtl } = useTranslation();
  const [activeSaleId, setActiveSaleId] = useState<number | null>(null);

  if (!customer) return null;

  const { stats } = customer;

  // ─── Payment method labels ────────────────────────────────
  const PM_LABEL: Record<string, string> = {
    cash: t("common.payment_methods.cash"),
    card: t("common.payment_methods.card"),
    transfer: t("common.payment_methods.transfer"),
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customer.name}
      description={t("customers.details.subtitle")}
      size="xl"
      footer={
        <Button variant="ghost" onClick={onClose}>
          {t("common.buttons.close")}
        </Button>
      }
    >
      <div className="space-y-5">
        {/* ── Contact info ── */}
        <div className="flex flex-wrap gap-3 text-sm text-[var(--color-text-secondary)]">
          {customer.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
              {customer.phone}
            </div>
          )}
          {customer.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
              {customer.email}
            </div>
          )}
          {customer.notes && (
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
              <span className="italic">{customer.notes}</span>
            </div>
          )}
          <Button
            variant="secondary"
            size="sm"
            className={cn("gap-1.5", isRtl ? "mr-auto" : "ml-auto")}
            onClick={onEdit}
          >
            <Pencil className="w-3.5 h-3.5" />
            {t("common.buttons.edit")}
          </Button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label={t("customers.details.orders_count")}
            value={String(stats.totalOrders)}
            icon={ShoppingBag}
          />
          <StatCard
            label={t("customers.details.total_spent")}
            value={formatCurrency(stats.totalSpent)}
            icon={TrendingUp}
          />
          <StatCard
            label={t("customers.details.current_debt")}
            value={formatCurrency(stats.debt)}
            icon={AlertCircle}
            highlight={stats.debt > 0}
          />
        </div>

        {/* ── Purchase history ── */}
        <div>
          <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
            {t("customers.details.orders")}
          </h4>

          {customer.sales.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-[var(--color-text-muted)]">
              <ShoppingBag className="w-8 h-8 mb-2" />
              <p className="text-sm">{t("customers.details.no_sales")}</p>
            </div>
          ) : (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] overflow-hidden max-h-64 overflow-y-auto">
              <div className="divide-y divide-[var(--color-border)]">
                {customer.sales.map((sale: Sale) => {
                  const itemCount = sale.items.reduce((s, i) => s + i.quantity, 0);
                  const isExpanded = activeSaleId === sale.id;

                  return (
                    <div key={sale.id}>
                      <button
                        onClick={() =>
                          setActiveSaleId(isExpanded ? null : sale.id)
                        }
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-[var(--color-bg-elevated)] transition-colors",
                          isRtl ? "text-right" : "text-left"
                        )}
                      >
                        {/* Receipt # */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Receipt className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                          <span className="font-mono text-xs text-[var(--color-text-secondary)]">
                            {sale.receiptNumber ?? `#${sale.id}`}
                          </span>
                        </div>

                        {/* Date */}
                        <span className="text-[var(--color-text-muted)] text-xs">
                          {formatDate(sale.createdAt)}
                        </span>

                        {/* Payment */}
                        <Badge variant="default">
                          {PM_LABEL[sale.paymentMethod] ?? sale.paymentMethod}
                        </Badge>

                        {/* Items count */}
                        <span className="text-xs text-[var(--color-text-muted)]">
                          {t("customers.details.items_count", { count: itemCount })}
                        </span>

                        {/* Status */}
                        {sale.status === "refunded" && (
                          <Badge variant="danger">{t("common.status.refunded")}</Badge>
                        )}

                        {/* Payment status badge */}
                        <PaymentStatusBadge
                          amountPaid={sale.amountPaid}
                          total={sale.total}
                          compact
                        />

                        {/* Total */}
                        <span className={cn("font-semibold text-[var(--color-text-primary)] tabular-nums", isRtl ? "mr-auto" : "ml-auto")}>
                          {formatCurrency(sale.total)}
                        </span>
                      </button>

                      {/* Expanded items */}
                      {isExpanded && (
                        <div className="px-12 pb-3 space-y-1 bg-[var(--color-bg-overlay)]">
                          {sale.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between text-xs text-[var(--color-text-secondary)]"
                            >
                              <span>
                                {item.variant?.product?.name ?? `Variante #${item.variantId}`}
                                {item.variant && (
                                  <span className="text-[var(--color-text-muted)] ml-1">
                                    {item.variant.size}/{item.variant.color}
                                  </span>
                                )}
                              </span>
                              <span className="tabular-nums">
                                {item.quantity} × {formatCurrency(item.unitPrice)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
