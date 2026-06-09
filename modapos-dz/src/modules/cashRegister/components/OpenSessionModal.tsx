import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface OpenSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (openingBalance: number, notes?: string) => Promise<boolean>;
}

export function OpenSessionModal({ isOpen, onClose, onSubmit }: OpenSessionModalProps) {
  const { t, isRtl } = useTranslation();
  const [openingBalance, setOpeningBalance] = useState<string>("5000");
  const [notes, setNotes] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setOpeningBalance("5000");
      setNotes("");
      setError(null);
      setIsSaving(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const val = parseFloat(openingBalance);
    if (isNaN(val) || val < 0) {
      setError(t("cashRegister.open_modal.required"));
      return;
    }

    setIsSaving(true);
    const success = await onSubmit(val, notes);
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
            {t("cashRegister.open_modal.title")}
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
        <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: 20 }}>
          {error && (
            <div
              style={{
                background: "rgba(186,26,26,0.06)",
                border: "1px solid rgba(186,26,26,0.18)",
                borderRadius: "var(--radius-md)",
                padding: "10px 14px",
                fontSize: 13,
                color: "var(--color-error)",
              }}
            >
              {error}
            </div>
          )}

          {/* Opening balance */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              style={{
                fontSize: "var(--text-label-md)",
                fontWeight: "var(--fw-label-md)",
                color: "var(--color-secondary)",
              }}
            >
              {t("cashRegister.open_modal.opening_balance")}
            </label>
            <input
              type="number"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              placeholder="0.00"
              required
              min="0"
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

          {/* Quick options */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
            {["0", "1000", "2000", "5000", "10000"].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setOpeningBalance(preset)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(208,197,175,0.25)",
                  background: "var(--color-surface-container-high)",
                  color: "var(--color-secondary)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = "1px solid var(--color-primary)";
                  e.currentTarget.style.color = "var(--color-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(208,197,175,0.25)";
                  e.currentTarget.style.color = "var(--color-secondary)";
                }}
              >
                {preset} DZD
              </button>
            ))}
          </div>

          {/* Notes */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              style={{
                fontSize: "var(--text-label-md)",
                fontWeight: "var(--fw-label-md)",
                color: "var(--color-secondary)",
              }}
            >
              {t("cashRegister.open_modal.notes")}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("cashRegister.open_modal.notes_placeholder")}
              rows={3}
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
            {isSaving ? t("common.buttons.saving", { defaultValue: "Enregistrement..." }) : t("cashRegister.open_modal.confirm")}
          </button>
        </div>
      </form>
    </div>
  );
}
