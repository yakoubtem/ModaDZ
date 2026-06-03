import { Printer, CheckCircle2, Phone, MapPin } from "lucide-react";
import type { Sale } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type PrinterWidth = "58mm" | "80mm";

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Espèces",
  card: "Carte bancaire",
  transfer: "Virement",
};

// ── Divider line that prints well on thermal paper ──────────────────────────
function ReceiptDivider({ style = "dashed" }: { style?: "dashed" | "solid" }) {
  if (style === "solid") {
    return (
      <div className="border-t border-black/30 my-1.5 print:border-black" />
    );
  }
  return (
    <div className="text-center leading-none my-1 text-[var(--color-text-muted)] print:text-black">
      {"- ".repeat(22)}
    </div>
  );
}

interface ReceiptPreviewProps {
  sale: Sale;
  amountPaid: number;
  onClose: () => void;
  closeLabel?: string;
  hideSuccessBanner?: boolean;
  /** Store info — should come from settings, falls back to sensible defaults */
  storeName?: string;
  storePhone?: string;
  storeAddress?: string;
  storeFooter?: string;
  /** Target printer paper width */
  printerWidth?: PrinterWidth;
}

export function ReceiptPreview({
  sale,
  amountPaid,
  onClose,
  closeLabel = "Nouvelle vente",
  hideSuccessBanner = false,
  storeName = "ModaDZ",
  storePhone,
  storeAddress,
  storeFooter = "Merci de votre visite ! À bientôt.",
  printerWidth = "80mm",
}: ReceiptPreviewProps) {
  const subtotal = sale.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  const handlePrint = () => {
    // Set thermal width before printing so @media print can target it
    document.body.dataset.printWidth = printerWidth;
    window.print();
    // Restore after a short delay (print dialog is synchronous on most platforms)
    setTimeout(() => {
      delete document.body.dataset.printWidth;
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ── Success banner ──────────────────────────────────────────── */}
      {!hideSuccessBanner && (
        <div className="flex items-center gap-3 p-4 rounded-[var(--radius-lg)] bg-[var(--color-success-subtle)] border border-[var(--color-success)]/30 animate-fade-in">
          <CheckCircle2 className="w-6 h-6 text-[var(--color-success)] shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[var(--color-success)]">
              Vente enregistrée avec succès !
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Vente #{sale.receiptNumber ?? sale.id} · {formatDate(sale.createdAt)}
            </p>
          </div>
        </div>
      )}

      {/* ── Receipt body (id used by print CSS) ─────────────────────── */}
      <div
        id="receipt-print-root"
        className={cn(
          "rounded-[var(--radius-lg)] border border-[var(--color-border)]",
          "bg-[var(--color-bg-elevated)] p-5 font-mono",
          "text-[var(--color-text-secondary)]",
          printerWidth === "58mm" ? "text-[10px]" : "text-[11px] sm:text-xs"
        )}
      >
        {/* ── Store header ─────────────────────────────────────────── */}
        <div className="text-center space-y-0.5 mb-2">
          <p className="text-base font-bold text-[var(--color-text-primary)] tracking-widest uppercase">
            {storeName}
          </p>

          {storeAddress && (
            <div className="flex items-center justify-center gap-1 text-[var(--color-text-muted)]">
              <MapPin className="w-3 h-3 shrink-0 print:hidden" />
              <span>{storeAddress}</span>
            </div>
          )}
          {storePhone && (
            <div className="flex items-center justify-center gap-1 text-[var(--color-text-muted)]">
              <Phone className="w-3 h-3 shrink-0 print:hidden" />
              <span>{storePhone}</span>
            </div>
          )}
        </div>

        <ReceiptDivider />

        {/* ── Receipt metadata ─────────────────────────────────────── */}
        <div className="text-center space-y-0.5 my-2">
          <p className="font-bold text-[var(--color-text-primary)] tracking-wider">
            TICKET N° {(sale.receiptNumber ?? `#${sale.id}`).toUpperCase()}
          </p>
          <p className="text-[var(--color-text-muted)]">{formatDate(sale.createdAt)}</p>
          {sale.user && (
            <p className="text-[var(--color-text-muted)]">
              Caissier : {sale.user.name}
            </p>
          )}
          {sale.customer && (
            <p className="text-[var(--color-text-muted)]">
              Client : {sale.customer.name}
            </p>
          )}
        </div>

        <ReceiptDivider />

        {/* ── Items ────────────────────────────────────────────────── */}
        <div className="space-y-2.5 my-2">
          {sale.items.map((item) => {
            const lineName =
              item.variant?.product?.name ?? `Article #${item.variantId}`;
            const variant = item.variant;
            const lineTotal = item.unitPrice * item.quantity - item.discount;

            return (
              <div key={item.id} className="space-y-0.5">
                {/* Product name — full width, wraps on narrow paper */}
                <div className="flex justify-between gap-1">
                  <span className="receipt-item-name font-medium text-[var(--color-text-primary)] break-words min-w-0 flex-1">
                    {lineName}
                  </span>
                  <span className="tabular-nums shrink-0 font-bold text-[var(--color-text-primary)]">
                    {formatCurrency(lineTotal)}
                  </span>
                </div>
                {/* Variant + qty details on second line */}
                <div className="flex justify-between text-[var(--color-text-muted)] pl-0">
                  <span>
                    {variant ? `${variant.size} / ${variant.color}` : ""}
                  </span>
                  <span className="tabular-nums">
                    {item.quantity} × {formatCurrency(item.unitPrice)}
                    {item.discount > 0 && ` − ${formatCurrency(item.discount)}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <ReceiptDivider />

        {/* ── Totals ───────────────────────────────────────────────── */}
        <div className="space-y-1 my-2">
          <div className="flex justify-between">
            <span>Sous-total</span>
            <span className="tabular-nums">{formatCurrency(subtotal)}</span>
          </div>

          {sale.discount > 0 && (
            <div className="flex justify-between text-[var(--color-warning)] print:text-black">
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

          <ReceiptDivider style="solid" />

          <div className="flex justify-between font-bold text-sm text-[var(--color-text-primary)]">
            <span>TOTAL</span>
            <span className="tabular-nums">{formatCurrency(sale.total)}</span>
          </div>

          <div className="flex justify-between">
            <span>Paiement</span>
            <span>{PAYMENT_LABELS[sale.paymentMethod] ?? sale.paymentMethod}</span>
          </div>

          {/* ── Cash: show amount received and either change or remaining debt ── */}
          {sale.paymentMethod === "cash" && (() => {
            const saleRemaining = Math.max(0, sale.total - sale.amountPaid);
            const cashChange = amountPaid > 0 ? Math.max(0, amountPaid - sale.total) : 0;

            if (cashChange > 0) {
              // Customer over-paid — show change
              return (
                <>
                  <div className="flex justify-between">
                    <span>Montant reçu</span>
                    <span className="tabular-nums">{formatCurrency(amountPaid)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--color-success)] font-semibold print:text-black">
                    <span>Monnaie</span>
                    <span className="tabular-nums">{formatCurrency(cashChange)}</span>
                  </div>
                </>
              );
            }

            if (saleRemaining > 0) {
              // Partial / zero payment — show amount paid + remaining debt
              return (
                <>
                  <div className="flex justify-between">
                    <span>Montant payé</span>
                    <span className="tabular-nums">{formatCurrency(sale.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between font-semibold print:text-black" style={{ color: "var(--color-danger, #ba1a1a)" }}>
                    <span>Reste (Dette)</span>
                    <span className="tabular-nums">{formatCurrency(saleRemaining)}</span>
                  </div>
                </>
              );
            }

            // Fully paid — nothing extra to show
            return null;
          })()}
        </div>

        <ReceiptDivider />

        {/* ── Footer ───────────────────────────────────────────────── */}
        <div className="text-center text-[var(--color-text-muted)] space-y-0.5 mt-2">
          <p>{storeFooter}</p>
          {/* Receipt ID in a scannable-friendly format */}
          <p className="text-[9px] tracking-wider opacity-60 mt-1 print:opacity-100">
            REF: {(sale.receiptNumber ?? `VNT-${String(sale.id).padStart(6, "0")}`).toUpperCase()}
          </p>
        </div>
      </div>

      {/* ── Actions ─────────────────────────────────────────────────── */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          size="md"
          className="gap-2 flex-1"
          onClick={handlePrint}
        >
          <Printer className="w-4 h-4" />
          Imprimer
          <span className="ml-auto text-[10px] opacity-50 bg-[var(--color-bg-overlay)] px-1.5 py-0.5 rounded">
            {printerWidth}
          </span>
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
