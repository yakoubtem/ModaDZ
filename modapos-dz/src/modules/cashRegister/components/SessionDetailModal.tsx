import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { CashSessionDetails } from "@/types";
import { toast } from "sonner";

interface SessionDetailModalProps {
  isOpen: boolean;
  sessionId: number | null;
  onClose: () => void;
  onPrint: (sessionId: number) => void;
}

export function SessionDetailModal({ isOpen, sessionId, onClose, onPrint }: SessionDetailModalProps) {
  const { t, isRtl } = useTranslation();
  const [details, setDetails] = useState<CashSessionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && sessionId) {
      setIsLoading(true);
      window.api.invoke("cashRegister:getSessionDetails", sessionId)
        .then((res: any) => {
          setDetails(res);
        })
        .catch((err) => {
          console.error(err);
          toast.error(t("cashRegister.toasts.error_load_details"));
          onClose();
        })
        .finally(() => setIsLoading(false));
    } else {
      setDetails(null);
    }
  }, [isOpen, sessionId, onClose, t]);

  if (!isOpen || !sessionId) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 900,
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
      <div
        className="animate-scale-in"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 800,
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
          <div>
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
              {t("cashRegister.tables.session_details")} #{sessionId}
            </h2>
            {details && (
              <p style={{ fontSize: 12, color: "var(--color-secondary)", marginTop: 4 }}>
                {t("cashRegister.tables.user")}: <strong>{details.session.user?.name}</strong> | Status:{" "}
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "var(--radius-full)",
                    background:
                      details.session.status === "open"
                        ? "rgba(39,104,104,0.1)"
                        : "rgba(208,197,175,0.2)",
                    color:
                      details.session.status === "open"
                        ? "var(--color-tertiary)"
                        : "var(--color-secondary)",
                    fontWeight: 700,
                    fontSize: 10,
                  }}
                >
                  {details.session.status.toUpperCase()}
                </span>
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
            <button
              type="button"
              className="btn-border"
              onClick={() => onPrint(sessionId)}
              style={{ gap: 6, padding: "6px 12px", fontSize: 12, marginBottom: 0 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>print</span>
              {t("common.buttons.print")}
            </button>
            <button
              type="button"
              onClick={onClose}
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
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 24, overflowY: "auto" }}>
          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="skeleton" style={{ height: 60, width: "100%" }} />
              <div className="skeleton" style={{ height: 120, width: "100%" }} />
            </div>
          ) : details ? (
            <>
              {/* Balances Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
                {[
                  { label: t("cashRegister.tables.opening"), val: details.session.openingBalance, color: "var(--color-secondary)" },
                  { label: t("cashRegister.close_modal.expected"), val: details.breakdown.expectedBalance, color: "var(--color-primary)" },
                  { label: t("cashRegister.close_modal.counted"), val: details.session.actualBalance ?? "—", color: "var(--color-on-surface)" },
                  { label: t("cashRegister.tables.difference"), val: details.session.difference ?? "—", color: details.session.difference === 0 ? "var(--color-tertiary)" : details.session.difference && Math.abs(details.session.difference) <= 1000 ? "var(--color-primary)" : details.session.difference ? "var(--color-error)" : "var(--color-secondary)" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "var(--color-surface-container-low)",
                      border: "1px solid rgba(208,197,175,0.25)",
                      borderRadius: 12,
                      padding: "12px 14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-outline)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {item.label}
                    </span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: item.color, direction: "ltr", textAlign: isRtl ? "right" : "left" }}>
                      {typeof item.val === "number" ? formatCurrency(item.val) : item.val}
                    </span>
                  </div>
                ))}
              </div>

              {/* Time Metadata */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--color-secondary)", borderBottom: "1px solid rgba(208, 197, 175, 0.15)", paddingBottom: 12, flexDirection: isRtl ? "row-reverse" : "row" }}>
                <span>
                  {t("cashRegister.tables.opened")}: <strong>{formatDateTime(details.session.openedAt)}</strong>
                </span>
                {details.session.closedAt && (
                  <span>
                    {t("cashRegister.tables.closed")}: <strong>{formatDateTime(details.session.closedAt)}</strong>
                  </span>
                )}
              </div>

              {/* Notes */}
              {(details.session.notes || details.session.actualBalance !== null) && (
                <div style={{ background: "rgba(208,197,175,0.08)", border: "1px solid rgba(208,197,175,0.2)", borderRadius: 12, padding: 14 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--color-secondary)", textTransform: "uppercase", margin: "0 0 6px 0" }}>
                    {t("cashRegister.close_modal.notes")}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--color-on-surface)", margin: 0, fontStyle: "italic" }}>
                    {details.session.notes || "—"}
                  </p>
                </div>
              )}

              {/* Movements Table */}
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--color-on-surface)", marginBottom: 12 }}>
                  {t("cashRegister.tabs.movements")}
                </h3>
                <div style={{ border: "1px solid rgba(208, 197, 175, 0.2)", borderRadius: 12, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "var(--color-surface-container-low)", borderBottom: "1px solid rgba(208, 197, 175, 0.2)" }}>
                        <th style={{ padding: "10px 14px", textAlign: isRtl ? "right" : "left", fontSize: 11, fontWeight: 700, color: "var(--color-secondary)" }}>{t("cashRegister.tables.date")}</th>
                        <th style={{ padding: "10px 14px", textAlign: isRtl ? "right" : "left", fontSize: 11, fontWeight: 700, color: "var(--color-secondary)" }}>{t("cashRegister.tables.type")}</th>
                        <th style={{ padding: "10px 14px", textAlign: isRtl ? "right" : "left", fontSize: 11, fontWeight: 700, color: "var(--color-secondary)" }}>{t("cashRegister.tables.reason")}</th>
                        <th style={{ padding: "10px 14px", textAlign: isRtl ? "left" : "right", fontSize: 11, fontWeight: 700, color: "var(--color-secondary)" }}>{t("cashRegister.tables.amount")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.movements.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ padding: "20px", fontSize: 13, color: "var(--color-secondary)", textAlign: "center", fontStyle: "italic" }}>
                            {t("cashRegister.tables.no_movements")}
                          </td>
                        </tr>
                      ) : (
                        details.movements.map((m) => {
                          const isPositive = m.amount >= 0;
                          return (
                            <tr key={m.id} style={{ borderBottom: "1px solid rgba(208, 197, 175, 0.1)" }}>
                              <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--color-secondary)" }}>
                                {new Date(m.createdAt).toLocaleTimeString(isRtl ? "ar-DZ" : "fr-DZ", { hour: "2-digit", minute: "2-digit" })}
                              </td>
                              <td style={{ padding: "10px 14px", fontSize: 12, fontWeight: 600 }}>
                                {t(`cashRegister.types.${m.type}`)}
                              </td>
                              <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--color-secondary)" }}>
                                {m.reason || "—"} {m.notes ? `(${m.notes})` : ""}
                              </td>
                              <td style={{ padding: "10px 14px", fontSize: 12, textAlign: isRtl ? "left" : "right", fontWeight: 700, color: isPositive ? "var(--color-tertiary)" : "var(--color-error)", direction: "ltr" }}>
                                {isPositive ? "+" : ""}{formatCurrency(m.amount)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
