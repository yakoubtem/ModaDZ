import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface CashMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: "cash_in" | "cash_out", amount: number, reason: string, notes?: string) => Promise<boolean>;
}

export function CashMovementModal({ isOpen, onClose, onSubmit }: CashMovementModalProps) {
  const { t, isRtl } = useTranslation();
  const [type, setType] = useState<"cash_in" | "cash_out">("cash_in");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    { value: t("cashRegister.movement_modal.preset_petty"), label: t("cashRegister.movement_modal.preset_petty") },
    { value: t("cashRegister.movement_modal.preset_transport"), label: t("cashRegister.movement_modal.preset_transport") },
    { value: t("cashRegister.movement_modal.preset_bank"), label: t("cashRegister.movement_modal.preset_bank") },
    { value: t("cashRegister.movement_modal.preset_correction"), label: t("cashRegister.movement_modal.preset_correction") },
    { value: "custom", label: isRtl ? "سبب مخصص..." : "Motif personnalisé..." },
  ];

  useEffect(() => {
    if (isOpen) {
      setType("cash_in");
      setAmount("");
      setReason(presets[0].value);
      setCustomReason("");
      setNotes("");
      setError(null);
      setIsSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError(t("cashRegister.open_modal.required", { defaultValue: "Veuillez saisir un montant valide" }));
      return;
    }

    const finalReason = reason === "custom" ? customReason.trim() : reason;
    if (!finalReason) {
      setError(t("cashRegister.movement_modal.reason_required", { defaultValue: "Veuillez spécifier un motif" }));
      return;
    }

    setIsSaving(true);
    const success = await onSubmit(type, val, finalReason, notes);
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
        className="animate-scale-in"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 480,
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
            padding: "24px 32px",
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
            {t("cashRegister.movement_modal.title")}
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
        <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: 18 }}>
          {error && (
            <div style={{ background: "rgba(186,26,26,0.06)", border: "1px solid rgba(186,26,26,0.18)", borderRadius: 8, padding: 10, fontSize: 13, color: "var(--color-error)" }}>
              {error}
            </div>
          )}

          {/* Type Choice */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-secondary)" }}>
              {t("cashRegister.movement_modal.type")}
            </label>
            <div style={{ display: "flex", gap: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
              <button
                type="button"
                onClick={() => setType("cash_in")}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "var(--radius-lg)",
                  border: type === "cash_in" ? "2px solid var(--color-tertiary)" : "1px solid rgba(208,197,175,0.3)",
                  background: type === "cash_in" ? "rgba(39,104,104,0.08)" : "var(--color-surface)",
                  color: type === "cash_in" ? "var(--color-tertiary)" : "var(--color-secondary)",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  flexDirection: isRtl ? "row-reverse" : "row",
                }}
              >
                <span className="material-symbols-outlined">arrow_downward</span>
                {t("cashRegister.movement_modal.cash_in")}
              </button>

              <button
                type="button"
                onClick={() => setType("cash_out")}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "var(--radius-lg)",
                  border: type === "cash_out" ? "2px solid var(--color-error)" : "1px solid rgba(208,197,175,0.3)",
                  background: type === "cash_out" ? "rgba(186,26,26,0.06)" : "var(--color-surface)",
                  color: type === "cash_out" ? "var(--color-error)" : "var(--color-secondary)",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  flexDirection: isRtl ? "row-reverse" : "row",
                }}
              >
                <span className="material-symbols-outlined">arrow_upward</span>
                {t("cashRegister.movement_modal.cash_out")}
              </button>
            </div>
          </div>

          {/* Amount */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-secondary)" }}>
              {t("cashRegister.movement_modal.amount")}
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              min="0.01"
              step="any"
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid rgba(208,197,175,0.4)",
                borderRadius: "var(--radius-lg)",
                background: "var(--color-surface)",
                color: "var(--color-on-surface)",
                fontSize: 15,
                fontWeight: 600,
                outline: "none",
                fontFamily: "var(--font-display)",
                direction: "ltr",
                textAlign: isRtl ? "right" : "left",
              }}
            />
          </div>

          {/* Reason Preset Dropdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-secondary)" }}>
              {t("cashRegister.movement_modal.reason")}
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid rgba(208,197,175,0.4)",
                borderRadius: "var(--radius-lg)",
                background: "var(--color-surface)",
                color: "var(--color-on-surface)",
                fontSize: 14,
                outline: "none",
                fontFamily: "var(--font-body)",
              }}
            >
              {presets.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Custom Reason input if chosen */}
          {reason === "custom" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder={isRtl ? "اكتب سبب الحركة..." : "Saisir le motif..."}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1px solid rgba(208,197,175,0.4)",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--color-surface)",
                  color: "var(--color-on-surface)",
                  fontSize: 14,
                  outline: "none",
                  fontFamily: "var(--font-body)",
                }}
              />
            </div>
          )}

          {/* Notes */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-secondary)" }}>
              {t("cashRegister.movement_modal.notes")}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("cashRegister.movement_modal.notes_placeholder")}
              rows={2}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid rgba(208,197,175,0.4)",
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
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "24px 32px",
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
          <button type="submit" className="btn-primary" disabled={isSaving} style={{ marginBottom: 0 }}>
            {isSaving ? t("common.buttons.saving") : t("cashRegister.movement_modal.confirm")}
          </button>
        </div>
      </form>
    </div>
  );
}
