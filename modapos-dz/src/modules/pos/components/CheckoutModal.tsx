import { useState, useEffect, useRef } from "react";
import { UserCircle, X, Printer, AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ReceiptPreview, type PrinterWidth } from "./ReceiptPreview";
import { CustomerFormModal } from "@/modules/customers/components/CustomerFormModal";
import { useCartStore, cartSelectors } from "@/store/cartStore";
import { useAuth } from "@/modules/auth/AuthContext";
import { useIPC } from "@/hooks/useIPC";
import { useReceiptSettings } from "../hooks/useReceiptSettings";
import type { Customer, Sale, PaymentMethod } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toastError, toastSuccess } from "@/components/ui/toast";

// ─── Printer width preference (localStorage) ─────────────────────────────────
const PRINTER_WIDTH_KEY = "moda_printer_width";

function getSavedPrinterWidth(): PrinterWidth {
  try {
    const saved = localStorage.getItem(PRINTER_WIDTH_KEY);
    if (saved === "58mm" || saved === "80mm") return saved;
  } catch {
    /* ignore */
  }
  return "80mm";
}

function savePrinterWidth(width: PrinterWidth) {
  try {
    localStorage.setItem(PRINTER_WIDTH_KEY, width);
  } catch {
    /* ignore */
  }
}

// ─── Payment method tabs ──────────────────────────────────────────────────────
const PAYMENT_METHODS: { value: PaymentMethod; label: string; emoji: string }[] = [
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

  // Receipt settings (store info + printer width)
  const { settings: receiptSettings } = useReceiptSettings();
  const [printerWidth, setPrinterWidth] = useState<PrinterWidth>(getSavedPrinterWidth);

  const handlePrinterWidthChange = (w: PrinterWidth) => {
    setPrinterWidth(w);
    savePrinterWidth(w);
  };

  // ── Local state ─────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>("form");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  // Default to total so the sale starts as fully paid
  const [amountPaid, setAmountPaid] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer search
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
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

  // ─── Derived debt values ─────────────────────────────────────────────────────
  // When amountPaid is blank, we treat it as full payment (no debt).
  const amountPaidNum = amountPaid === "" ? total : Math.max(0, parseFloat(amountPaid) || 0);

  // The amount we will write to the DB — capped at total, floored at 0.
  const dbAmountPaid =
    paymentMethod !== "cash"
      ? total                                    // non-cash: always fully paid
      : Math.min(amountPaidNum, total);          // cash: what they actually gave

  const remaining = Math.max(0, total - dbAmountPaid);

  // Cash change (only when they over-pay)
  const change = paymentMethod === "cash" && amountPaidNum > total ? amountPaidNum - total : 0;

  // Whether the form can be submitted
  const hasDebt = remaining > 0;
  const missingCustomer = hasDebt && !selectedCustomer;

  const canSubmit =
    items.length > 0 &&
    dbAmountPaid >= 0 &&
    !missingCustomer;

  // ── Checkout handler ────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!user) return;

    // Client-side guard: customer required for debt
    if (hasDebt && !selectedCustomer) {
      toastError(
        "Client requis",
        "Veuillez sélectionner un client pour enregistrer une dette."
      );
      return;
    }

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
        amountPaid: dbAmountPaid,
        items: items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          discount: i.discount,
        })),
      });

      clearCart();
      setCompletedSale(sale);
      setPhase("receipt");

      if (remaining > 0) {
        toastSuccess(
          "Vente enregistrée",
          `Dette de ${formatCurrency(remaining)} enregistrée pour ${selectedCustomer?.name}.`
        );
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur lors du paiement";
      toastError(message, "Veuillez réessayer ou vérifier la connexion.");
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

  // ── Customer selector helpers ───────────────────────────────────────────────
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

  const handleQuickCustomerCreate = async (data: {
    name: string;
    phone?: string;
    email?: string;
    notes?: string;
  }) => {
    try {
      const newCustomer = await api<Customer>("customers:create", data);
      selectCustomer(newCustomer);
      toastSuccess("Client créé avec succès");
      return true;
    } catch {
      toastError("Erreur lors de la création du client");
      return false;
    }
  };

  return (
    <>
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
        scrollable={phase === "form"}
        footer={
          phase === "form" ? (
            <>
              <Button
                variant="ghost"
                onClick={handleClose}
                disabled={isSubmitting}
              >
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
          ) : (
            // Receipt footer: printer width toggle
            <div className="flex items-center gap-2 w-full">
              <Printer className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
              <span className="text-xs text-[var(--color-text-muted)] mr-1">
                Largeur :
              </span>
              {(["58mm", "80mm"] as PrinterWidth[]).map((w) => (
                <button
                  key={w}
                  onClick={() => handlePrinterWidthChange(w)}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-[var(--radius-sm)] border font-medium transition-all",
                    printerWidth === w
                      ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)]"
                      : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)]"
                  )}
                >
                  {w}
                </button>
              ))}
            </div>
          )
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

            {/* ── Customer — required when there is a debt ── */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
                Client{hasDebt ? " (requis pour la dette)" : " (optionnel)"}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <UserCircle
                    className={cn(
                      "w-4 h-4",
                      missingCustomer
                        ? "text-[var(--color-danger)]"
                        : "text-[var(--color-text-muted)]"
                    )}
                  />
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
                    "bg-[var(--color-bg-elevated)] border",
                    missingCustomer
                      ? "border-[var(--color-danger)]"
                      : "border-[var(--color-border)]",
                    "rounded-[var(--radius-md)] text-[var(--color-text-primary)]",
                    "placeholder:text-[var(--color-text-muted)]",
                    "focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                  )}
                />
                {selectedCustomer && (
                  <button
                    onClick={clearCustomer}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                {/* Dropdown */}
                {showCustomerDropdown && (
                  <div className="absolute z-50 top-full mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-[var(--shadow-lg)] overflow-hidden flex flex-col animate-scale-in">
                    {customerResults.length > 0 ? (
                      <div className="max-h-48 overflow-y-auto">
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
                    ) : (
                      <div className="px-3 py-2 text-sm text-[var(--color-text-muted)] text-center italic">
                        Aucun client trouvé.
                      </div>
                    )}
                    <div className="p-1 border-t border-[var(--color-border)] bg-[var(--color-bg-overlay)]">
                      <Button
                        variant="primary"
                        onClick={() => {
                          setShowCustomerDropdown(false);
                          setIsCustomerFormOpen(true);
                        }}
                        className="w-full text-xs"
                        size="sm"
                      >
                        + Nouveau client
                      </Button>
                    </div>
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

                {/* ── Live payment summary ── */}
                <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] overflow-hidden">
                  <div className="divide-y divide-[var(--color-border)]">
                    {/* Total row */}
                    <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                      <span className="text-[var(--color-text-secondary)]">Total</span>
                      <span className="tabular-nums font-semibold text-[var(--color-text-primary)]">
                        {formatCurrency(total)}
                      </span>
                    </div>
                    {/* Amount paid row */}
                    <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                      <span className="text-[var(--color-text-secondary)]">Montant payé</span>
                      <span className="tabular-nums font-semibold text-[var(--color-text-primary)]">
                        {formatCurrency(dbAmountPaid)}
                      </span>
                    </div>
                    {/* Remaining / change row */}
                    {change > 0 ? (
                      <div className="flex justify-between items-center px-4 py-2.5 text-sm bg-[var(--color-success-subtle)]">
                        <span className="text-[var(--color-success)] font-medium">Monnaie à rendre</span>
                        <span className="tabular-nums font-bold text-[var(--color-success)]">
                          {formatCurrency(change)}
                        </span>
                      </div>
                    ) : remaining > 0 ? (
                      <div className="flex justify-between items-center px-4 py-2.5 text-sm bg-[var(--color-danger-subtle)]">
                        <span className="text-[var(--color-danger)] font-medium">Reste (Dette)</span>
                        <span className="tabular-nums font-bold text-[var(--color-danger)]">
                          {formatCurrency(remaining)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center px-4 py-2.5 text-sm bg-[var(--color-success-subtle)]">
                        <span className="text-[var(--color-success)] font-medium">Soldé</span>
                        <span className="tabular-nums font-bold text-[var(--color-success)]">✓</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Debt warning / customer-required error ── */}
                {remaining > 0 && (
                  <div
                    className={cn(
                      "flex items-start gap-2.5 px-3.5 py-3 rounded-[var(--radius-md)] border animate-fade-in",
                      missingCustomer
                        ? "bg-[var(--color-danger-subtle)] border-[var(--color-danger)]/30"
                        : "bg-amber-50 border-amber-200"
                    )}
                  >
                    <AlertTriangle
                      className={cn(
                        "w-4 h-4 mt-0.5 shrink-0",
                        missingCustomer ? "text-[var(--color-danger)]" : "text-amber-600"
                      )}
                    />
                    <div>
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          missingCustomer ? "text-[var(--color-danger)]" : "text-amber-700"
                        )}
                      >
                        {missingCustomer
                          ? "Client requis"
                          : `Cette vente générera une dette client de ${formatCurrency(remaining)}`}
                      </p>
                      <p
                        className={cn(
                          "text-xs mt-0.5",
                          missingCustomer ? "text-[var(--color-danger)]/80" : "text-amber-600"
                        )}
                      >
                        {missingCustomer
                          ? "Veuillez sélectionner un client pour enregistrer une dette."
                          : `Le client ${selectedCustomer?.name} sera redevable de ${formatCurrency(remaining)}.`}
                      </p>
                    </div>
                  </div>
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
              amountPaid={dbAmountPaid}
              onClose={handleClose}
              storeName={receiptSettings.storeName}
              storePhone={receiptSettings.storePhone}
              storeAddress={receiptSettings.storeAddress}
              storeFooter={receiptSettings.receiptFooter}
              printerWidth={printerWidth}
            />
          )
        )}
      </Modal>

      <CustomerFormModal
        isOpen={isCustomerFormOpen}
        onClose={() => setIsCustomerFormOpen(false)}
        onSubmit={async (data) => {
          const success = await handleQuickCustomerCreate(data);
          if (success) {
            setIsCustomerFormOpen(false);
          }
          return success;
        }}
      />
    </>
  );
}
