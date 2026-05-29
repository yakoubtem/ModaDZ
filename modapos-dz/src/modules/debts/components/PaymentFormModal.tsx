import { useState } from "react";
import { createPortal } from "react-dom";
import { useDebtPayments } from "../hooks/useDebtPayments";
import type { AddPaymentPayload } from "@/types";

interface PaymentFormModalProps {
  isOpen: boolean;
  customerId: number;
  customerName: string;
  currentDebt: number;
  onClose: () => void;
  onSuccess: () => void;
}

const METHOD_OPTIONS = [
  { value: "cash", label: "Espèces", icon: "payments" },
  { value: "card", label: "Carte", icon: "credit_card" },
  { value: "transfer", label: "Virement", icon: "account_balance" },
] as const;

export function PaymentFormModal({
  isOpen,
  customerId,
  customerName,
  currentDebt,
  onClose,
  onSuccess,
}: PaymentFormModalProps) {
  const { isSubmitting, addPayment } = useDebtPayments();

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"cash" | "card" | "transfer">("cash");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const formatCurrencyLocal = (n: number) =>
    new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZD",
      minimumFractionDigits: 0,
    }).format(n);

  const handleSubmit = async () => {
    const parsed = parseFloat(amount.replace(/\s/g, "").replace(",", "."));
    if (!parsed || parsed <= 0) {
      setError("Veuillez saisir un montant valide");
      return;
    }
    setError("");

    const payload: AddPaymentPayload = {
      customerId,
      amount: parsed,
      method,
      note: note.trim() || undefined,
    };

    const ok = await addPayment(payload, () => {
      setAmount("");
      setNote("");
      setMethod("cash");
      onSuccess();
      onClose();
    });

    if (!ok && !isSubmitting) {
      // error already handled in hook via toast
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setAmount("");
    setNote("");
    setMethod("cash");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

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
          background: "rgba(79,70,53,0.35)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className="animate-scale-in"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 440,
          background: "var(--color-surface-container-lowest)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid rgba(208,197,175,0.3)",
          boxShadow: "var(--shadow-elevated)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 24px 20px",
            borderBottom: "1px solid rgba(208,197,175,0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-headline-md)",
                fontWeight: "var(--fw-headline-lg)",
                color: "var(--color-on-surface)",
                marginBottom: 4,
              }}
            >
              Enregistrer un paiement
            </p>
            <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)" }}>
              {customerName} · Dette restante:{" "}
              <strong style={{ color: "var(--color-error)" }}>
                {formatCurrencyLocal(currentDebt)}
              </strong>
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-secondary)",
              display: "flex",
              padding: 4,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>
          {/* Amount */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: "var(--text-label-md)",
                fontWeight: "var(--fw-label-md)",
                color: "var(--color-on-surface-variant)",
                marginBottom: 8,
              }}
            >
              Montant (DZD) *
            </label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--color-outline)",
                  fontSize: "var(--text-body-md)",
                  fontWeight: 600,
                }}
              >
                DZD
              </span>
              <input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                }}
                placeholder="0"
                style={{
                  width: "100%",
                  background: "var(--color-sand)",
                  border: error ? "1.5px solid var(--color-error)" : "none",
                  borderRadius: "var(--radius-lg)",
                  padding: "14px 16px 14px 60px",
                  fontSize: "var(--text-headline-md)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  color: "var(--color-on-surface)",
                  outline: "none",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 0 0 2px rgba(212,175,55,0.25)")
                }
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
            </div>
            {/* Quick-fill buttons */}
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              {[1000, 5000, 10000, currentDebt].map((v) => (
                <button
                  key={v}
                  className="chip chip-default"
                  style={{ cursor: "pointer", border: "none", fontSize: 11 }}
                  onClick={() => setAmount(String(Math.round(v)))}
                >
                  {v === currentDebt ? "Tout" : `${(v / 1000).toFixed(0)}k`}
                </button>
              ))}
            </div>
            {error && (
              <p style={{ color: "var(--color-error)", fontSize: 12, marginTop: 6 }}>{error}</p>
            )}
          </div>

          {/* Method */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: "var(--text-label-md)",
                fontWeight: "var(--fw-label-md)",
                color: "var(--color-on-surface-variant)",
                marginBottom: 8,
              }}
            >
              Méthode de paiement *
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {METHOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMethod(opt.value)}
                  style={{
                    padding: "12px 8px",
                    borderRadius: "var(--radius-lg)",
                    border: `1.5px solid ${
                      method === opt.value
                        ? "var(--color-primary-container)"
                        : "rgba(208,197,175,0.4)"
                    }`,
                    background:
                      method === opt.value
                        ? "rgba(212,175,55,0.12)"
                        : "var(--color-sand)",
                    color:
                      method === opt.value
                        ? "var(--color-primary)"
                        : "var(--color-secondary)",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    fontFamily: "var(--font-body)",
                    fontSize: 12,
                    fontWeight: method === opt.value ? 700 : 400,
                    transition: "all 0.15s ease",
                  }}
                >
                  <span className="material-symbols-outlined filled" style={{ fontSize: 22 }}>
                    {opt.icon}
                  </span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: "block",
                fontSize: "var(--text-label-md)",
                fontWeight: "var(--fw-label-md)",
                color: "var(--color-on-surface-variant)",
                marginBottom: 8,
              }}
            >
              Note (optionnelle)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Remarque sur ce paiement..."
              rows={2}
              style={{
                width: "100%",
                background: "var(--color-sand)",
                border: "none",
                borderRadius: "var(--radius-lg)",
                padding: "12px 16px",
                fontSize: "var(--text-body-sm)",
                fontFamily: "var(--font-body)",
                color: "var(--color-on-surface)",
                outline: "none",
                resize: "none",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 0 0 2px rgba(212,175,55,0.25)")
              }
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-border"
              onClick={handleClose}
              disabled={isSubmitting}
              style={{ flex: 1, justifyContent: "center" }}
            >
              Annuler
            </button>
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={isSubmitting || !amount}
              style={{ flex: 2, justifyContent: "center" }}
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, animation: "spin 1s linear infinite" }}>
                    progress_activity
                  </span>
                  Enregistrement...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check</span>
                  Confirmer le paiement
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
