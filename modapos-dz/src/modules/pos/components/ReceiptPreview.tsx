import { Printer, CheckCircle2 } from "lucide-react";
import type { Sale } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const STORE_NAME = "ModaDZ";
const STORE_TAGLINE = "Votre boutique de mode";

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Espèces",
  card: "Carte bancaire",
  transfer: "Virement",
};

interface ReceiptPreviewProps {
  sale: Sale;
  amountPaid: number;
  onClose: () => void;
  closeLabel?: string;
  hideSuccessBanner?: boolean;
}

export function ReceiptPreview({ sale, amountPaid, onClose, closeLabel = "Nouvelle vente", hideSuccessBanner = false }: ReceiptPreviewProps) {
  const change = amountPaid > 0 ? Math.max(0, amountPaid - sale.total) : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Success banner */}
      {!hideSuccessBanner && (
        <div className="flex items-center gap-3 p-4 rounded-[var(--radius-lg)] bg-[var(--color-success-subtle)] border border-[var(--color-success)]/30">
          <CheckCircle2 className="w-6 h-6 text-[var(--color-success)] shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[var(--color-success)]">
              Vente enregistrée avec succès !
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Vente #{sale.id} · {formatDate(sale.createdAt)}
            </p>
          </div>
        </div>
      )}

      {/* Receipt body */}
      <div
        className={cn(
          "rounded-[var(--radius-lg)] border border-[var(--color-border)]",
          "bg-[var(--color-bg-elevated)] p-5 space-y-4 font-mono text-xs",
          "text-[var(--color-text-secondary)]"
        )}
      >
        {/* Header */}
        <div className="text-center space-y-0.5">
          <p className="text-base font-bold text-[var(--color-text-primary)] tracking-wide">
            {STORE_NAME}
          </p>
          <p className="text-[var(--color-text-muted)]">{STORE_TAGLINE}</p>
          <div className="border-t border-dashed border-[var(--color-border)] my-2" />
          <p>Vente #{sale.id.toString().padStart(6, "0")}</p>
          <p>{formatDate(sale.createdAt)}</p>
          {sale.user && <p>Caissier: {sale.user.name}</p>}
          {sale.customer && <p>Client: {sale.customer.name}</p>}
        </div>

        <div className="border-t border-dashed border-[var(--color-border)]" />

        {/* Items */}
        <div className="space-y-2">
          {sale.items.map((item) => {
            const lineName =
              item.variant?.product?.name ??
              `Variante #${item.variantId}`;
            const variant = item.variant;
            const lineTotal = item.unitPrice * item.quantity - item.discount;

            return (
              <div key={item.id}>
                <div className="flex justify-between gap-2">
                  <span className="flex-1 truncate text-[var(--color-text-primary)]">
                    {lineName}
                  </span>
                  <span className="tabular-nums shrink-0">
                    {formatCurrency(lineTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[var(--color-text-muted)]">
                  <span>
                    {variant ? `${variant.size} / ${variant.color}` : ""}
                  </span>
                  <span className="tabular-nums">
                    {item.quantity} × {formatCurrency(item.unitPrice)}
                    {item.discount > 0 &&
                      ` − ${formatCurrency(item.discount)}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-dashed border-[var(--color-border)]" />

        {/* Totals */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Sous-total</span>
            <span className="tabular-nums">
              {formatCurrency(
                sale.items.reduce(
                  (s, i) => s + i.unitPrice * i.quantity,
                  0
                )
              )}
            </span>
          </div>

          {sale.discount > 0 && (
            <div className="flex justify-between text-[var(--color-warning)]">
              <span>Remise</span>
              <span className="tabular-nums">−{formatCurrency(sale.discount)}</span>
            </div>
          )}

          {sale.tax > 0 && (
            <div className="flex justify-between">
              <span>TVA</span>
              <span className="tabular-nums">{formatCurrency(sale.tax)}</span>
            </div>
          )}

          <div className="flex justify-between font-bold text-sm text-[var(--color-text-primary)] pt-1 border-t border-[var(--color-border)]">
            <span>TOTAL</span>
            <span className="tabular-nums">{formatCurrency(sale.total)}</span>
          </div>

          <div className="flex justify-between">
            <span>Mode de paiement</span>
            <span>{PAYMENT_LABELS[sale.paymentMethod] ?? sale.paymentMethod}</span>
          </div>

          {sale.paymentMethod === "cash" && amountPaid > 0 && (
            <>
              <div className="flex justify-between">
                <span>Montant reçu</span>
                <span className="tabular-nums">{formatCurrency(amountPaid)}</span>
              </div>
              <div className="flex justify-between text-[var(--color-success)] font-semibold">
                <span>Monnaie</span>
                <span className="tabular-nums">{formatCurrency(change)}</span>
              </div>
            </>
          )}
        </div>

        <div className="border-t border-dashed border-[var(--color-border)]" />

        {/* Footer */}
        <div className="text-center text-[var(--color-text-muted)] space-y-0.5">
          <p>Merci de votre visite !</p>
          <p>À bientôt chez {STORE_NAME}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          size="md"
          className="gap-2 flex-1"
          onClick={() => window.print()}
        >
          <Printer className="w-4 h-4" />
          Imprimer
        </Button>
        <Button
          variant="primary"
          size="md"
          className="flex-1"
          onClick={onClose}
        >
          {closeLabel}
        </Button>
      </div>
    </div>
  );
}
