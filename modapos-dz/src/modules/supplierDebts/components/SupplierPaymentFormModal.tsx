import { useState } from "react";
import { createPortal } from "react-dom";
import { useSupplierDebtPayments } from "../hooks/useSupplierDebtPayments";
import type { AddSupplierPaymentPayload } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/modules/auth/AuthContext";

interface SupplierPaymentFormModalProps {
  isOpen: boolean;
  supplierId: number;
  supplierName: string;
  currentDebt: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function SupplierPaymentFormModal({
  isOpen,
  supplierId,
  supplierName,
  currentDebt,
  onClose,
  onSuccess,
}: SupplierPaymentFormModalProps) {
  const { t, isRtl, language } = useTranslation();
  const { user } = useAuth();
  const { isSubmitting, addPayment } = useSupplierDebtPayments();

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const METHOD_OPTIONS = [
    { value: "cash",     label: t("common.payment_methods.cash"),     icon: "payments" },
    { value: "card",     label: t("common.payment_methods.card"),     icon: "credit_card" },
    { value: "transfer", label: t("common.payment_methods.transfer"), icon: "account_balance" },
  ] as const;

  const formatCurrencyLocal = (n: number) =>
    new Intl.NumberFormat(language === "ar" ? "ar-DZ" : "fr-DZ", {
      style: "currency",
      currency: "DZD",
      minimumFractionDigits: 0,
    }).format(n);

  const handleSubmit = async () => {
    const parsed = parseFloat(amount.replace(/\s/g, "").replace(",", "."));
    if (!parsed || parsed <= 0) {
      setError(t("supplierDebts.payment_modal.invalid_amount"));
      return;
    }
    setError("");

    const payload: AddSupplierPaymentPayload = {
      supplierId,
      amount: parsed,
      method,
      reference: reference.trim() || undefined,
      notes: notes.trim() || undefined,
      createdBy: user?.id || 1,
    };

    const ok = await addPayment(payload);

    if (ok) {
      setAmount("");
      setNotes("");
      setReference("");
      setMethod("cash");
      onSuccess();
      onClose();
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setAmount("");
    setNotes("");
    setReference("");
    setMethod("cash");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  const QUICK_AMOUNTS = [1000, 5000, 10000, 50000, currentDebt];

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(30,24,16,0.4)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className="animate-scale-in"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 480,
          background: "var(--color-surface-container-lowest)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid rgba(208,197,175,0.25)",
          boxShadow: "0 32px 64px rgba(30,24,16,0.2), 0 0 0 1px rgba(255,255,255,0.6) inset",
          overflow: "hidden",
          textAlign: isRtl ? "right" : "left",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "28px 32px 24px",
            borderBottom: "1px solid rgba(208,197,175,0.15)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexDirection: isRtl ? "row-reverse" : "row" }}>
            <div>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--color-on-surface)",
                  marginBottom: 6,
                  letterSpacing: "-0.01em",
                }}
              >
                {t("supplierDebts.payment_modal.title")}
              </p>
              <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)", lineHeight: 1.5 }}>
                {supplierName}
              </p>
            </div>
            <button
              onClick={handleClose}
              style={{
                background: "var(--color-surface-container-high)",
                border: "none",
                cursor: "pointer",
                color: "var(--color-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 6,
                borderRadius: "var(--radius-full)",
                flexShrink: 0,
                [isRtl ? "marginRight" : "marginLeft"]: 16,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
            </button>
          </div>

          {/* Debt summary pill */}
          <div
            style={{
              marginTop: 16,
              background: "rgba(186,26,26,0.06)",
              border: "1px solid rgba(186,26,26,0.15)",
              borderRadius: "var(--radius-lg)",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexDirection: isRtl ? "row-reverse" : "row",
            }}
          >
            <span style={{ fontSize: "var(--text-label-sm)", color: "var(--color-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700 }}>
              {t("supplierDebts.supplier_debts.remaining")}
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 18,
                color: "var(--color-error)",
                letterSpacing: "-0.02em",
                direction: "ltr",
              }}
            >
              {formatCurrencyLocal(currentDebt)}
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Amount field */}
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
              {t("supplierDebts.payment_modal.amount_label")}
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
                min="1"
                step="1"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(""); }}
                placeholder="0"
                style={{
                  width: "100%",
                  background: "var(--color-sand)",
                  border: error
                    ? "1.5px solid var(--color-error)"
                    : "1.5px solid rgba(208,197,175,0.3)",
                  borderRadius: "var(--radius-lg)",
                  paddingLeft: isRtl ? 18 : 64,
                  paddingRight: isRtl ? 64 : 18,
                  paddingTop: 14,
                  paddingBottom: 14,
                  fontSize: 24,
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  color: "var(--color-on-surface)",
                  outline: "none",
                  letterSpacing: "-0.02em",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                  textAlign: isRtl ? "right" : "left"
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-tertiary)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(39,104,104,0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = error ? "var(--color-error)" : "rgba(208,197,175,0.3)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Quick-fill buttons */}
            <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
              {QUICK_AMOUNTS.map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(String(Math.round(v)))}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "var(--radius-full)",
                    border: "1.5px solid rgba(208,197,175,0.4)",
                    background: parseFloat(amount) === Math.round(v)
                      ? "rgba(39,104,104,0.1)"
                      : "transparent",
                    color: parseFloat(amount) === Math.round(v)
                      ? "var(--color-tertiary)"
                      : "var(--color-secondary)",
                    fontFamily: "var(--font-body)",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.12s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  {v === currentDebt ? t("supplierDebts.payment_modal.settle_all") : `+${v.toLocaleString(language === "ar" ? "ar-DZ" : "fr-DZ")}`}
                </button>
              ))}
            </div>

            {error && (
              <p style={{ color: "var(--color-error)", fontSize: 12, marginTop: 8, display: "flex", alignItems: "center", gap: 4, flexDirection: isRtl ? "row-reverse" : "row" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>
                {error}
              </p>
            )}
          </div>

          {/* Reference field */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "var(--text-label-md)",
                fontWeight: 700,
                color: "var(--color-on-surface-variant)",
                marginBottom: 8,
                letterSpacing: "0.02em",
              }}
            >
              {t("supplierDebts.payment_modal.reference")}
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={t("supplierDebts.payment_modal.reference_placeholder")}
              style={{
                width: "100%",
                background: "var(--color-sand)",
                border: "1.5px solid rgba(208,197,175,0.3)",
                borderRadius: "var(--radius-lg)",
                padding: "12px 16px",
                fontSize: "var(--text-body-sm)",
                fontFamily: "var(--font-body)",
                color: "var(--color-on-surface)",
                outline: "none",
                transition: "border-color 0.15s, box-shadow 0.15s",
                textAlign: isRtl ? "right" : "left"
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

          {/* Payment method */}
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
              {t("supplierDebts.payment_modal.method")}
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {METHOD_OPTIONS.map((opt) => {
                const active = method === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setMethod(opt.value)}
                    style={{
                      padding: "14px 8px",
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
                    <span className="material-symbols-outlined filled" style={{ fontSize: 22 }}>
                      {opt.icon}
                    </span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note */}
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
              {t("supplierDebts.payment_modal.note")}{" "}
              <span style={{ color: "var(--color-secondary)", fontWeight: 400, textTransform: "lowercase" }}>
                {t("supplierDebts.payment_modal.optional")}
              </span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("supplierDebts.payment_modal.note_placeholder")}
              rows={2}
              style={{
                width: "100%",
                background: "var(--color-sand)",
                border: "1.5px solid rgba(208,197,175,0.3)",
                borderRadius: "var(--radius-lg)",
                padding: "12px 16px",
                fontSize: "var(--text-body-sm)",
                fontFamily: "var(--font-body)",
                color: "var(--color-on-surface)",
                outline: "none",
                resize: "none",
                lineHeight: 1.6,
                transition: "border-color 0.15s, box-shadow 0.15s",
                textAlign: isRtl ? "right" : "left"
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

        {/* Footer actions */}
        <div
          style={{
            padding: "20px 32px 28px",
            borderTop: "1px solid rgba(208,197,175,0.15)",
            display: "flex",
            gap: 12,
            flexDirection: isRtl ? "row-reverse" : "row",
          }}
        >
          <button
            className="btn-border"
            onClick={handleClose}
            disabled={isSubmitting}
            style={{ flex: 1, justifyContent: "center", padding: "12px 0" }}
          >
            {t("common.buttons.cancel")}
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !amount}
            style={{ flex: 2, justifyContent: "center", padding: "12px 0" }}
          >
            {isSubmitting ? (
              <>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18, animation: "spin 1s linear infinite", [isRtl ? "marginLeft" : "marginRight"]: 6 }}
                >
                  progress_activity
                </span>
                {t("supplierDebts.payment_modal.saving")}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 18, [isRtl ? "marginLeft" : "marginRight"]: 6 }}>check_circle</span>
                {t("supplierDebts.payment_modal.confirm_btn")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
