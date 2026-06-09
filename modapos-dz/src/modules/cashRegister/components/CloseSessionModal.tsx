import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency } from "@/lib/utils";
import type { CashSessionDetails } from "@/types";
import { toast } from "sonner";

interface CloseSessionModalProps {
  isOpen: boolean;
  sessionId: number | null;
  onClose: () => void;
  onSubmit: (sessionId: number, actualBalance: number, notes?: string) => Promise<boolean>;
}

export function CloseSessionModal({ isOpen, sessionId, onClose, onSubmit }: CloseSessionModalProps) {
  const { t, isRtl } = useTranslation();
  const [details, setDetails] = useState<CashSessionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actualBalance, setActualBalance] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && sessionId) {
      setIsLoading(true);
      setActualBalance("");
      setNotes("");
      setError(null);
      window.api.invoke("cashRegister:getSessionDetails", sessionId)
        .then((res: any) => {
          setDetails(res);
          setActualBalance(String(res.breakdown.expectedBalance));
        })
        .catch((err) => {
          console.error(err);
          toast.error(t("cashRegister.toasts.error_load_details", { defaultValue: "Erreur de chargement de session" }));
          onClose();
        })
        .finally(() => setIsLoading(false));
    } else {
      setDetails(null);
    }
  }, [isOpen, sessionId, onClose, t]);

  if (!isOpen || !sessionId) return null;

  const expected = details?.breakdown.expectedBalance ?? 0;
  const counted = parseFloat(actualBalance) || 0;
  const difference = counted - expected;

  // Compute status
  let statusText = t("cashRegister.close_modal.balanced");
  let statusColor = "var(--color-tertiary)";
  let statusBg = "rgba(39,104,104,0.06)";
  let statusBorder = "1px solid rgba(39,104,104,0.18)";

  if (difference !== 0) {
    if (Math.abs(difference) <= 1000) {
      statusText = t("cashRegister.close_modal.warning");
      statusColor = "var(--color-primary)";
      statusBg = "rgba(212,175,55,0.08)";
      statusBorder = "1px solid rgba(212,175,55,0.2)";
    } else {
      statusText = t("cashRegister.close_modal.critical");
      statusColor = "var(--color-error)";
      statusBg = "rgba(186,26,26,0.06)";
      statusBorder = "1px solid rgba(186,26,26,0.18)";
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const val = parseFloat(actualBalance);
    if (isNaN(val) || val < 0) {
      setError(t("cashRegister.open_modal.required"));
      return;
    }

    if (Math.abs(difference) > 1000) {
      const confirmText = t("cashRegister.close_modal.critical_confirm", {
        defaultValue: `Attention: Un écart important de ${formatCurrency(difference)} a été détecté. Êtes-vous sûr de vouloir clôturer la caisse ?`
      });
      if (!window.confirm(confirmText)) {
        return;
      }
    }

    setIsSaving(true);
    const success = await onSubmit(sessionId, val, notes);
    setIsSaving(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 950,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 16px",
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(30,24,16,0.38)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <form
        onSubmit={handleSubmit}
        className="animate-scale-in animate-duration-250"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 580,
          maxHeight: "calc(100vh - 40px)",
          background: "var(--color-surface-container-lowest)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid rgba(208,197,175,0.25)",
          boxShadow: "0 32px 80px rgba(30,24,16,0.2), 0 0 0 1px rgba(255,255,255,0.55) inset",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          textAlign: isRtl ? "right" : "left",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 28px",
            borderBottom: "1px solid rgba(208,197,175,0.15)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: isRtl ? "row-reverse" : "row",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 18,
              fontWeight: 700,
              color: "var(--color-on-surface)",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            {t("cashRegister.close_modal.title")} #{sessionId}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 4,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 18, overflowY: "auto" }}>
          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="skeleton" style={{ height: 16, width: "60%" }} />
              <div className="skeleton" style={{ height: 80, width: "100%" }} />
              <div className="skeleton" style={{ height: 40, width: "100%" }} />
            </div>
          ) : details ? (
            <>
              {error && (
                <div style={{ background: "rgba(186,26,26,0.06)", border: "1px solid rgba(186,26,26,0.18)", borderRadius: 8, padding: 10, fontSize: 13, color: "var(--color-error)" }}>
                  {error}
                </div>
              )}

              {/* Status Banner */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 8, background: statusBg, border: statusBorder, flexDirection: isRtl ? "row-reverse" : "row" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: statusColor }}>{statusText}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: statusColor, direction: "ltr" }}>
                  {difference > 0 ? "+" : ""}{formatCurrency(difference)}
                </span>
              </div>

              {/* Breakdown details */}
              <div style={{ border: "1px solid rgba(208, 197, 175, 0.2)", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ background: "var(--color-surface-container-low)", padding: "10px 14px", borderBottom: "1px solid rgba(208, 197, 175, 0.2)" }}>
                  <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-secondary)", margin: 0 }}>
                    {t("cashRegister.close_modal.breakdown")}
                  </h3>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  {[
                    { label: t("cashRegister.tables.opening"), val: details.breakdown.openingBalance, color: "inherit" },
                    { label: t("cashRegister.types.sale"), val: details.breakdown.sales, color: "var(--color-tertiary)" },
                    { label: t("cashRegister.types.refund"), val: -details.breakdown.refunds, color: "var(--color-error)" },
                    { label: t("cashRegister.types.expense"), val: -details.breakdown.expenses, color: "var(--color-error)" },
                    { label: t("cashRegister.types.supplier_payment"), val: -details.breakdown.supplierPayments, color: "var(--color-error)" },
                    { label: t("cashRegister.types.cash_in") + " (Manual)", val: details.breakdown.cashIn, color: "var(--color-tertiary)" },
                    { label: t("cashRegister.types.cash_out") + " (Manual)", val: -details.breakdown.cashOut, color: "var(--color-error)" },
                  ].map((row, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderBottom: idx === 6 ? "none" : "1px solid rgba(208, 197, 175, 0.1)", fontSize: 13, flexDirection: isRtl ? "row-reverse" : "row" }}>
                      <span style={{ color: "var(--color-secondary)" }}>{row.label}</span>
                      <span style={{ fontWeight: 600, color: row.color, direction: "ltr" }}>{formatCurrency(row.val)}</span>
                    </div>
                  ))}

                  <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", background: "rgba(208, 197, 175, 0.12)", fontSize: 14, fontWeight: 700, flexDirection: isRtl ? "row-reverse" : "row" }}>
                    <span>{t("cashRegister.close_modal.expected")}</span>
                    <span style={{ color: "var(--color-primary)", direction: "ltr" }}>{formatCurrency(expected)}</span>
                  </div>
                </div>
              </div>

              {/* Counting Input */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-secondary)" }}>
                  {t("cashRegister.close_modal.actual_cash")}
                </label>
                <input
                  type="number"
                  value={actualBalance}
                  onChange={(e) => setActualBalance(e.target.value)}
                  placeholder="0.00"
                  required
                  min="0"
                  step="any"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid rgba(208, 197, 175, 0.4)",
                    borderRadius: "var(--radius-lg)",
                    background: "var(--color-surface)",
                    color: "var(--color-on-surface)",
                    fontSize: 16,
                    fontWeight: 700,
                    outline: "none",
                    fontFamily: "var(--font-display)",
                    direction: "ltr",
                    textAlign: isRtl ? "right" : "left",
                  }}
                />
              </div>

              {/* Notes */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-secondary)" }}>
                  {t("cashRegister.close_modal.notes")}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("cashRegister.close_modal.notes_placeholder")}
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid rgba(208, 197, 175, 0.4)",
                    borderRadius: "var(--radius-lg)",
                    background: "var(--color-surface)",
                    color: "var(--color-on-surface)",
                    fontSize: 13,
                    outline: "none",
                    fontFamily: "var(--font-body)",
                    resize: "none",
                  }}
                />
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 28px",
            borderTop: "1px solid rgba(208,197,175,0.15)",
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            background: "rgba(248,246,240,0.4)",
            flexDirection: isRtl ? "row-reverse" : "row",
          }}
        >
          <button type="button" className="btn-border" onClick={onClose} disabled={isSaving} style={{ marginBottom: 0 }}>
            {t("common.buttons.cancel")}
          </button>
          <button type="submit" className="btn-primary" disabled={isSaving || !details} style={{ marginBottom: 0 }}>
            {isSaving ? t("common.buttons.saving") : t("cashRegister.close_modal.confirm")}
          </button>
        </div>
      </form>
    </div>
  );
}
