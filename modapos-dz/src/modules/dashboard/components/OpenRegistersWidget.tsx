import { formatCurrency, initials } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/AuthContext";

interface OpenRegisterInfo {
  id: number;
  userId: number;
  userName: string;
  openedAt: string;
  openingBalance: number;
  expectedBalance: number;
}

interface OpenRegistersWidgetProps {
  openRegisters: OpenRegisterInfo[];
  isLoading?: boolean;
}

export function OpenRegistersWidget({ openRegisters, isLoading }: OpenRegistersWidgetProps) {
  const { t, isRtl } = useTranslation();
  const navigate = useNavigate();
  const { can } = useAuth();

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate("/cash-register");
  };

  return (
    <div
      onClick={() => navigate("/cash-register")}
      style={{
        background: "rgba(99,102,241,0.03)",
        border: "1px solid rgba(99,102,241,0.12)",
        borderRadius: "var(--radius-xl)",
        padding: "20px 24px",
        boxShadow: "var(--shadow-card)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        cursor: "pointer",
        transition: "all 0.2s ease",
        textAlign: isRtl ? "right" : "left",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.border = "1px solid rgba(99,102,241,0.25)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = "1px solid rgba(99,102,241,0.12)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexDirection: isRtl ? "row-reverse" : "row" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <span
            className="material-symbols-outlined filled"
            style={{ fontSize: 18, color: "#6366f1" }}
          >
            point_of_sale
          </span>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 14,
              color: "var(--color-on-surface)",
              letterSpacing: "-0.01em",
            }}
          >
            {t("cashRegister.widgets.open_registers")}
          </p>
        </div>
        {!isLoading && openRegisters.length > 0 && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              background: "rgba(99,102,241,0.1)",
              color: "#6366f1",
              padding: "2px 8px",
              borderRadius: "var(--radius-full)",
            }}
          >
            {openRegisters.length} Active
          </span>
        )}
      </div>

      {/* Registers List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 48, width: "100%", borderRadius: "var(--radius-lg)" }} />
          ))
        ) : openRegisters.length === 0 ? (
          <div style={{ textAlign: "center", padding: "12px 0", color: "var(--color-secondary)", fontSize: 13, fontStyle: "italic" }}>
            {t("cashRegister.widgets.no_open_registers")}
          </div>
        ) : (
          openRegisters.map((reg) => (
            <div
              key={reg.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: "rgba(255,255,255,0.7)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid rgba(208,197,175,0.15)",
                flexDirection: isRtl ? "row-reverse" : "row",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "rgba(99,102,241,0.1)",
                    color: "#6366f1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {initials(reg.userName)}
                </div>
                <div style={{ textAlign: isRtl ? "right" : "left" }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-on-surface)", margin: 0 }}>
                    {reg.userName}
                  </p>
                  <p style={{ fontSize: 10, color: "var(--color-secondary)", margin: 0 }}>
                    Ouvert: {new Date(reg.openedAt).toLocaleTimeString(isRtl ? "ar-DZ" : "fr-DZ", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
                <div style={{ textAlign: isRtl ? "left" : "right" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "var(--color-success)", margin: 0, direction: "ltr" }}>
                    {formatCurrency(reg.expectedBalance)}
                  </p>
                </div>
                {can("cashRegister.close") && (
                  <button
                    className="btn-border"
                    onClick={handleCloseClick}
                    style={{
                      padding: "4px 8px",
                      fontSize: 10,
                      gap: 2,
                      background: "rgba(239,68,68,0.05)",
                      border: "1px solid rgba(239,68,68,0.15)",
                      color: "var(--color-error)",
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 12 }}>lock</span>
                    {t("cashRegister.widgets.close_shortcut")}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
