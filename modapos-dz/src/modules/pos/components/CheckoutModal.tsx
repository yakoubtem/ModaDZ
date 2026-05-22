import { useState, useEffect, useRef } from "react";
import { UserCircle, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ReceiptPreview } from "./ReceiptPreview";
import { useCartStore, cartSelectors } from "@/store/cartStore";
import { useAuth } from "@/modules/auth/AuthContext";
import { useIPC } from "@/hooks/useIPC";
import type { Customer, Sale, PaymentMethod } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Payment method tabs ──────────────────────────────────
const PAYMENT_METHODS: { value: PaymentMethod; label: string; emoji: string }[] =
  [
    { value: "cash", label: "Espèces", emoji: "💵" },
    { value: "card", label: "Carte", emoji: "💳" },
    { value: "transfer", label: "Virement", emoji: "🏦" },
  ];

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Phase = "form" | "receipt";

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const api = useIPC();
  const { user } = useAuth();
  const clearCart = useCartStore((s) => s.clearCart);
  const items = useCartStore((s) => s.items);
  const cartDiscount = useCartStore((s) => s.cartDiscount);
  const total = useCartStore(cartSelectors.total);
  const totalItemDiscounts = useCartStore(cartSelectors.totalItemDiscounts);

  // ── Local state ──────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>("form");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer search
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const customerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Completed sale (shown in receipt phase)
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  // Reset local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPhase("form");
      setPaymentMethod("cash");
      setAmountPaid("");
      setNotes("");
      setCustomerQuery("");
      setCustomerResults([]);
      setSelectedCustomer(null);
      setCompletedSale(null);
    }
  }, [isOpen]);

  // Customer search debounce
  useEffect(() => {
    if (!customerQuery.trim()) {
      setCustomerResults([]);
      return;
    }
    if (customerTimerRef.current) clearTimeout(customerTimerRef.current);
    customerTimerRef.current = setTimeout(async () => {
      try {
        const results = await api<Customer[]>("customers:search", customerQuery);
        setCustomerResults(results);
        setShowCustomerDropdown(true);
      } catch {
        /* silent */
      }
    }, 300);
  }, [customerQuery, api]);

  // Derived values
  const amountPaidNum = parseFloat(amountPaid) || 0;
  const change = paymentMethod === "cash" && amountPaidNum >= total
    ? amountPaidNum - total
    : 0;
  const canSubmit =
    items.length > 0 &&
    (paymentMethod !== "cash" || amountPaidNum >= total || amountPaid === "");

  // ── Checkout handler ─────────────────────────────────────
  const handleConfirm = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      const sale = await api<Sale>("pos:checkout", {
        userId: user.id,
        customerId: selectedCustomer?.id,
        paymentMethod,
        notes: notes.trim() || undefined,
        total,
        discount: totalItemDiscounts + cartDiscount,
        tax: 0,
        items: items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          discount: i.discount,
        })),
      });

      // Clear cart immediately
      clearCart();
      setCompletedSale(sale);
      setPhase("receipt");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur lors du paiement";
      toast.error(message, { duration: 6000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (phase === "receipt") {
      clearCart();
    }
    onClose();
  };

  // ── Customer selector helpers ─────────────────────────────
  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerQuery(customer.name);
    setShowCustomerDropdown(false);
    setCustomerResults([]);
  };

  const clearCustomer = () => {
    setSelectedCustomer(null);
    setCustomerQuery("");
    setCustomerResults([]);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={phase === "form" ? "Finaliser la vente" : "Reçu de vente"}
      description={
        phase === "form"
          ? `${items.length} article${items.length > 1 ? "s" : ""} · Total: ${formatCurrency(total)}`
          : undefined
      }
      size="md"
      footer={
        phase === "form" ? (
          <>
            <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              isLoading={isSubmitting}
              disabled={!canSubmit}
              className="gap-2 min-w-32"
            >
              Confirmer la vente
            </Button>
          </>
        ) : undefined
      }
    >
      {phase === "form" ? (
        <div className="space-y-5">
          {/* ── Order Summary ── */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] overflow-hidden">
            <div className="bg-[var(--color-bg-overlay)] px-3 py-2 border-b border-[var(--color-border)]">
              <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                Récapitulatif
              </p>
            </div>
            <div className="divide-y divide-[var(--color-border)]">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  <div>
                    <span className="text-[var(--color-text-primary)]">
                      {item.productName}
                    </span>
                    <span className="text-[var(--color-text-muted)] ml-1.5">
                      {item.size}/{item.color} × {item.quantity}
                    </span>
                  </div>
                  <span className="tabular-nums text-[var(--color-text-primary)]">
                    {formatCurrency(item.unitPrice * item.quantity - item.discount)}
                  </span>
                </div>
              ))}
            </div>
            {/* Totals strip */}
            <div className="bg-[var(--color-bg-overlay)] px-3 py-2 border-t border-[var(--color-border)] space-y-1">
              {totalItemDiscounts + cartDiscount > 0 && (
                <div className="flex justify-between text-xs text-[var(--color-warning)]">
                  <span>Remise totale</span>
                  <span className="tabular-nums">
                    −{formatCurrency(totalItemDiscounts + cartDiscount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-[var(--color-text-primary)]">
                <span>Total</span>
                <span className="tabular-nums text-[var(--color-accent)]">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>

          {/* ── Customer (optional) ── */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
              Client (optionnel)
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <UserCircle className="w-4 h-4 text-[var(--color-text-muted)]" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un client…"
                value={customerQuery}
                onChange={(e) => {
                  setCustomerQuery(e.target.value);
                  setSelectedCustomer(null);
                }}
                onFocus={() =>
                  customerResults.length > 0 && setShowCustomerDropdown(true)
                }
                className={cn(
                  "w-full h-9 pl-9 pr-8 text-sm",
                  "bg-[var(--color-bg-elevated)] border border-[var(--color-border)]",
                  "rounded-[var(--radius-md)] text-[var(--color-text-primary)]",
                  "placeholder:text-[var(--color-text-muted)]",
                  "focus:outline-none focus:border-[var(--color-accent)]"
                )}
              />
              {selectedCustomer && (
                <button
                  onClick={clearCustomer}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              {/* Dropdown */}
              {showCustomerDropdown && customerResults.length > 0 && (
                <div className="absolute z-50 top-full mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-lg overflow-hidden">
                  {customerResults.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => selectCustomer(c)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-[var(--color-bg-overlay)] transition-colors"
                    >
                      <UserCircle className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
                      <span className="text-[var(--color-text-primary)]">
                        {c.name}
                      </span>
                      {c.phone && (
                        <span className="text-[var(--color-text-muted)] text-xs ml-auto">
                          {c.phone}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Payment method ── */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
              Mode de paiement
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map(({ value, label, emoji }) => (
                <button
                  key={value}
                  onClick={() => setPaymentMethod(value)}
                  className={cn(
                    "flex flex-col items-center gap-1 py-3 rounded-[var(--radius-md)]",
                    "border-2 text-sm font-medium transition-all duration-150",
                    paymentMethod === value
                      ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)]"
                      : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]"
                  )}
                >
                  <span className="text-xl">{emoji}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Amount paid (cash only) ── */}
          {paymentMethod === "cash" && (
            <div className="space-y-3">
              <Input
                label="Montant reçu (DZD)"
                type="number"
                min={0}
                step={100}
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder={total.toFixed(0)}
                hint="Laissez vide si le montant exact est donné"
              />

              {/* Change display */}
              {amountPaidNum >= total && amountPaidNum > 0 && (
                <div className="flex items-center justify-between px-4 py-3 rounded-[var(--radius-md)] bg-[var(--color-success-subtle)] border border-[var(--color-success)]/30">
                  <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                    Monnaie à rendre
                  </span>
                  <span className="text-xl font-bold text-[var(--color-success)] tabular-nums">
                    {formatCurrency(change)}
                  </span>
                </div>
              )}

              {/* Warning: insufficient amount */}
              {amountPaidNum > 0 && amountPaidNum < total && (
                <p className="text-xs text-[var(--color-danger)] text-center">
                  Montant insuffisant —{" "}
                  {formatCurrency(total - amountPaidNum)} manquant
                </p>
              )}
            </div>
          )}

          {/* ── Notes ── */}
          <Textarea
            label="Notes (optionnel)"
            placeholder="Informations supplémentaires…"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      ) : (
        // Receipt phase
        completedSale && (
          <ReceiptPreview
            sale={completedSale}
            amountPaid={amountPaidNum}
            onClose={handleClose}
          />
        )
      )}
    </Modal>
  );
}
