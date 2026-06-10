import { useState, useEffect, useRef } from "react";
import { UserCircle, X, Printer, AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
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
import { useTranslation } from "@/hooks/useTranslation";
import { OpenSessionModal } from "@/modules/cashRegister/components/OpenSessionModal";

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
const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: "cash",     label: "Espèces",  icon: "payments" },
  { value: "card",     label: "Carte",    icon: "credit_card" },
  { value: "transfer", label: "Virement", icon: "account_balance" },
];

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSession: any | null;
  isActiveLoading: boolean;
  onSessionOpened: (session: any) => void;
}

type Phase = "form" | "receipt";

export function CheckoutModal({ isOpen, onClose, activeSession, isActiveLoading, onSessionOpened }: CheckoutModalProps) {
  const { t, isRtl } = useTranslation();
  const api = useIPC();
  const { user } = useAuth();
  const clearCart = useCartStore((s) => s.clearCart);
  const items = useCartStore((s) => s.items);
  const cartDiscount = useCartStore((s) => s.cartDiscount);
  const total = useCartStore(cartSelectors.total);
  const totalItemDiscounts = useCartStore(cartSelectors.totalItemDiscounts);
  const cartCustomer = useCartStore((s) => s.selectedCustomer);
  const setCartCustomer = useCartStore((s) => s.setSelectedCustomer);

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
  const [isOpenSessionOpen, setIsOpenSessionOpen] = useState(false);

  const handleOpenSessionSubmit = async (openingBalance: number, notes?: string) => {
    if (!user) return false;
    try {
      const session = await api<any>("cashRegister:openSession", { userId: user.id, openingBalance, notes });
      toastSuccess(t("cashRegister.toasts.open_success", { defaultValue: "Caisse ouverte avec succès !" }));
      onSessionOpened(session);
      return true;
    } catch (err: any) {
      toastError(err.message || t("cashRegister.toasts.error_open", { defaultValue: "Erreur lors de l'ouverture de la caisse" }));
      return false;
    }
  };

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
      setCustomerQuery(cartCustomer ? cartCustomer.name : "");
      setCustomerResults([]);
      setSelectedCustomer(cartCustomer);
      setCompletedSale(null);
    }
  }, [isOpen, cartCustomer]);

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
    !missingCustomer &&
    (paymentMethod !== "cash" || activeSession !== null) &&
    !isSubmitting;

  // ── Checkout handler ────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!user) return;

    // Client-side guard: customer required for debt
    if (hasDebt && !selectedCustomer) {
      toastError(
        t("pos.checkout_modal.customer_required"),
        t("pos.checkout_modal.customer_required_desc")
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
          t("pos.checkout_modal.sale_saved"),
          t("pos.checkout_modal.debt_saved_toast", {
            amount: formatCurrency(remaining),
            name: selectedCustomer?.name ?? "",
          })
        );
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("pos.checkout_modal.payment_error");
      toastError(message, t("pos.checkout_modal.payment_error_desc"));
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
    setCartCustomer(customer);
    setCustomerQuery(customer.name);
    setShowCustomerDropdown(false);
    setCustomerResults([]);
  };

  const clearCustomer = () => {
    setSelectedCustomer(null);
    setCartCustomer(null);
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
      toastSuccess(t("pos.checkout_modal.customer_created_success"));
      return true;
    } catch {
      toastError(t("pos.checkout_modal.customer_created_error"));
      return false;
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={phase === "form" ? t("pos.checkout_modal.finalize_sale") : t("pos.checkout_modal.sale_receipt")}
        description={
          phase === "form"
            ? `${t("pos.cart.items_count", { count: items.length })} · ${t("pos.checkout_modal.total")}: ${formatCurrency(total)}`
            : undefined
        }
        size="md"
        scrollable={phase === "form"}
        footer={
          phase === "form" ? (
            <div style={{ display: "flex", gap: 12, width: "100%" }}>
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={isSubmitting}
                className="h-11 text-sm font-semibold rounded-[var(--radius-lg)]"
                style={{ flex: 1 }}
              >
                {t("pos.checkout_modal.cancel")}
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirm}
                isLoading={isSubmitting}
                disabled={!canSubmit}
                className="h-11 text-sm font-semibold rounded-[var(--radius-lg)] gap-2"
                style={{ flex: 2 }}
              >
                {!isSubmitting && (
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
                )}
                {t("pos.checkout_modal.confirm_sale")}
              </Button>
            </div>
          ) : (
            // Receipt footer: printer width toggle
            <div className="flex items-center gap-2 w-full">
              <Printer className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
              <span className="text-xs text-[var(--color-text-muted)] mr-1">
                {t("pos.checkout_modal.printer_width")}
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
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* ── Order Summary ── */}
            <div
              style={{
                borderRadius: "var(--radius-lg)",
                border: "1.5px solid rgba(208,197,175,0.3)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background: "rgba(208,197,175,0.1)",
                  padding: "10px 16px",
                  borderBottom: "1.5px solid rgba(208,197,175,0.2)",
                }}
              >
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--color-secondary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  {t("pos.checkout_modal.summary")}
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {items.map((item) => (
                  <div
                    key={item.variantId}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 16px",
                      borderBottom: "1px solid rgba(208,197,175,0.15)",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-on-surface)" }}>
                        {item.productName}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--color-secondary)", [isRtl ? "marginRight" : "marginLeft"]: 6 }}>
                        {item.size}/{item.color} × {item.quantity}
                      </span>
                    </div>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-body-sm)", color: "var(--color-on-surface)" }}>
                      {formatCurrency(item.unitPrice * item.quantity - item.discount)}
                    </span>
                  </div>
                ))}
              </div>
              {/* Totals strip */}
              <div
                style={{
                  background: "rgba(208,197,175,0.06)",
                  padding: "12px 16px",
                  borderTop: "1.5px solid rgba(208,197,175,0.15)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                {totalItemDiscounts + cartDiscount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--color-warning)", fontWeight: 600 }}>
                    <span>{t("pos.checkout_modal.total_discount")}</span>
                    <span>
                      −{formatCurrency(totalItemDiscounts + cartDiscount)}
                    </span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, color: "var(--color-on-surface)" }}>
                  <span>{t("pos.checkout_modal.total")}</span>
                  <span style={{ color: "var(--color-tertiary)" }}>
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Customer — required when there is a debt ── */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "var(--text-label-md)",
                  fontWeight: 700,
                  color: "var(--color-on-surface-variant)",
                  marginBottom: 10,
                  letterSpacing: "0.02em",
                }}
              >
                {t("pos.checkout_modal.customer_label")}{hasDebt ? t("pos.checkout_modal.customer_required_label") : t("pos.checkout_modal.customer_optional_label")}
              </label>
              <div className="relative">
                <div className={cn("absolute top-1/2 -translate-y-1/2 pointer-events-none", isRtl ? "right-4" : "left-4")}>
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
                  placeholder={t("pos.checkout_modal.search_customer_placeholder")}
                  value={customerQuery}
                  onChange={(e) => {
                    setCustomerQuery(e.target.value);
                    setSelectedCustomer(null);
                  }}
                  style={{
                    width: "100%",
                    background: "var(--color-sand)",
                    border: missingCustomer
                      ? "1.5px solid var(--color-danger)"
                      : "1.5px solid rgba(208,197,175,0.3)",
                    borderRadius: "var(--radius-lg)",
                    paddingTop: 14,
                    paddingBottom: 14,
                    paddingLeft: isRtl ? (selectedCustomer ? 44 : 14) : 44,
                    paddingRight: isRtl ? 44 : (selectedCustomer ? 44 : 14),
                    fontSize: "var(--text-body-sm)",
                    fontFamily: "var(--font-body)",
                    color: "var(--color-on-surface)",
                    outline: "none",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-tertiary)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(39,104,104,0.12)";
                    if (customerResults.length > 0) setShowCustomerDropdown(true);
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = missingCustomer ? "var(--color-danger)" : "rgba(208,197,175,0.3)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                {selectedCustomer && (
                  <button
                    onClick={clearCustomer}
                    className={cn("absolute top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer", isRtl ? "left-4" : "right-4")}
                  >
                    <X className="w-4 h-4" />
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
                              <span className={cn("text-[var(--color-text-muted)] text-xs", isRtl ? "mr-auto" : "ml-auto")}>
                                {c.phone}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-3 py-2 text-sm text-[var(--color-text-muted)] text-center italic">
                        {t("pos.checkout_modal.no_customer_found")}
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
                        {t("pos.checkout_modal.new_customer")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Payment method ── */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "var(--text-label-md)",
                  fontWeight: 700,
                  color: "var(--color-on-surface-variant)",
                  marginBottom: 10,
                  letterSpacing: "0.02em",
                }}
              >
                {t("pos.checkout_modal.payment_method")}
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {PAYMENT_METHODS.map((opt) => {
                  const active = paymentMethod === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setPaymentMethod(opt.value)}
                      style={{
                        padding: "16px 8px",
                        borderRadius: "var(--radius-lg)",
                        border: active
                          ? "2px solid var(--color-tertiary)"
                          : "1.5px solid rgba(208,197,175,0.35)",
                        background: active ? "rgba(39,104,104,0.07)" : "var(--color-sand)",
                        color: active ? "var(--color-tertiary)" : "var(--color-secondary)",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        fontFamily: "var(--font-body)",
                        fontSize: 12,
                        fontWeight: active ? 700 : 500,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span className="material-symbols-outlined filled" style={{ fontSize: 24 }}>
                        {opt.icon}
                      </span>
                      {t("common.payment_methods." + opt.value)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Amount paid (cash only) ── */}
            {paymentMethod === "cash" && !activeSession && !isActiveLoading && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "24px",
                  borderRadius: "var(--radius-lg)",
                  border: "1.5px dashed var(--color-danger)",
                  background: "rgba(186,26,26,0.03)",
                  textAlign: "center",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "var(--radius-full)",
                    background: "rgba(186,26,26,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-danger)",
                  }}
                >
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--color-danger)", marginBottom: 4 }}>
                    {t("cashRegister.toasts.error_no_session", { defaultValue: "Veuillez d'abord ouvrir la caisse." })}
                  </h4>
                  <p style={{ fontSize: 13, color: "var(--color-secondary)", maxWidth: 360, margin: "0 auto", lineHeight: 1.5 }}>
                    Veuillez ouvrir votre session de caisse afin de pouvoir enregistrer des règlements en espèces.
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => setIsOpenSessionOpen(true)}
                  className="h-10 text-xs font-semibold rounded-[var(--radius-md)] gap-2"
                  style={{ background: "var(--color-danger)", borderColor: "var(--color-danger)" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>lock_open</span>
                  {t("cashRegister.open_modal.title", { defaultValue: "Ouvrir la caisse" })}
                </Button>
              </div>
            )}

            {paymentMethod === "cash" && isActiveLoading && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 24 }}>
                <span className="text-sm text-[var(--color-text-muted)]">Chargement de la session de caisse...</span>
              </div>
            )}

            {paymentMethod === "cash" && activeSession && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "var(--text-label-md)",
                      fontWeight: 700,
                      color: "var(--color-on-surface-variant)",
                      marginBottom: 10,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {t("pos.checkout_modal.cash_received")}
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        [isRtl ? "right" : "left"]: 18,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--color-outline)",
                        fontSize: 14,
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        pointerEvents: "none",
                      }}
                    >
                      DZD
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={100}
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder={total.toFixed(0)}
                      style={{
                        width: "100%",
                        background: "var(--color-sand)",
                        border: "1.5px solid rgba(208,197,175,0.3)",
                        borderRadius: "var(--radius-lg)",
                        paddingTop: 18,
                        paddingBottom: 18,
                        paddingLeft: isRtl ? 18 : 64,
                        paddingRight: isRtl ? 64 : 18,
                        fontSize: 28,
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        color: "var(--color-on-surface)",
                        outline: "none",
                        letterSpacing: "-0.02em",
                        transition: "border-color 0.15s, box-shadow 0.15s",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "var(--color-tertiary)";
                        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(39,104,104,0.12)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "rgba(208,197,175,0.3)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  <p style={{ fontSize: 12, color: "var(--color-secondary)", marginTop: 6 }}>
                    {t("pos.checkout_modal.cash_received_help")}
                  </p>
                </div>

                {/* ── Live payment summary ── */}
                <div
                  style={{
                    border: "1.5px solid rgba(208,197,175,0.3)",
                    borderRadius: "var(--radius-lg)",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {/* Total row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1.5px solid rgba(208,197,175,0.2)" }}>
                      <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)" }}>{t("pos.checkout_modal.total")}</span>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--color-on-surface)" }}>
                        {formatCurrency(total)}
                      </span>
                    </div>
                    {/* Amount paid row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: change > 0 || remaining > 0 ? "1.5px solid rgba(208,197,175,0.2)" : "none" }}>
                      <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)" }}>{t("pos.checkout_modal.amount_paid_live")}</span>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--color-on-surface)" }}>
                        {formatCurrency(dbAmountPaid)}
                      </span>
                    </div>
                    {/* Remaining / change row */}
                    {change > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "rgba(39,104,104,0.06)", borderTop: "1.5px solid rgba(39,104,104,0.15)" }}>
                        <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-tertiary)", fontWeight: 700 }}>{t("pos.checkout_modal.change_to_return")}</span>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--color-tertiary)" }}>
                          {formatCurrency(change)}
                        </span>
                      </div>
                    )}
                    {remaining > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "rgba(186,26,26,0.06)", borderTop: "1.5px solid rgba(186,26,26,0.15)" }}>
                        <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-error)", fontWeight: 700 }}>{t("pos.checkout_modal.remaining_debt")}</span>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--color-error)" }}>
                          {formatCurrency(remaining)}
                        </span>
                      </div>
                    )}
                    {!change && !remaining && (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "rgba(39,104,104,0.06)", borderTop: "1.5px solid rgba(39,104,104,0.15)" }}>
                        <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-tertiary)", fontWeight: 700 }}>{t("pos.checkout_modal.settled")}</span>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--color-tertiary)" }}>✓</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Debt warning / customer-required error ── */}
                {remaining > 0 && (
                  <div
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 rounded-[var(--radius-lg)] border animate-fade-in",
                      missingCustomer
                        ? "bg-[var(--color-danger-subtle)]/60 border-[var(--color-danger)]/30"
                        : "bg-amber-50/60 border-amber-200"
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
                          ? t("pos.checkout_modal.customer_required")
                          : t("pos.checkout_modal.debt_warning", { amount: formatCurrency(remaining) })}
                      </p>
                      <p
                        className={cn(
                          "text-xs mt-0.5",
                          missingCustomer ? "text-[var(--color-danger)]/80" : "text-amber-600"
                        )}
                      >
                        {missingCustomer
                          ? t("pos.checkout_modal.customer_required_desc")
                          : t("pos.checkout_modal.debt_warning_desc", { name: selectedCustomer?.name ?? "", amount: formatCurrency(remaining) })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Notes ── */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "var(--text-label-md)",
                  fontWeight: 700,
                  color: "var(--color-on-surface-variant)",
                  marginBottom: 10,
                  letterSpacing: "0.02em",
                }}
              >
                {t("pos.checkout_modal.notes_label")}{" "}
                <span style={{ color: "var(--color-secondary)", fontWeight: 400, textTransform: "lowercase" }}>
                  {t("pos.checkout_modal.notes_optional")}
                </span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("pos.checkout_modal.notes_placeholder")}
                rows={2}
                style={{
                  width: "100%",
                  background: "var(--color-sand)",
                  border: "1.5px solid rgba(208,197,175,0.3)",
                  borderRadius: "var(--radius-lg)",
                  padding: "14px 16px",
                  fontSize: "var(--text-body-sm)",
                  fontFamily: "var(--font-body)",
                  color: "var(--color-on-surface)",
                  outline: "none",
                  resize: "none",
                  lineHeight: 1.6,
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-tertiary)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(39,104,104,0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(208,197,175,0.3)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </div>
        ) : (
          // Receipt phase
          completedSale && (
            <ReceiptPreview
              sale={completedSale}
              amountPaid={dbAmountPaid}
              onClose={handleClose}
              closeLabel={t("pos.receipt.new_sale")}
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

      <OpenSessionModal
        isOpen={isOpenSessionOpen}
        onClose={() => setIsOpenSessionOpen(false)}
        onSubmit={handleOpenSessionSubmit}
      />
    </>
  );
}
