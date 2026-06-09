import { useLicense } from "@/contexts/LicenseContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useNavigate } from "react-router-dom";

export function LicenseWidget({ isLoading }: { isLoading?: boolean }) {
  const { t, isRtl } = useTranslation();
  const navigate = useNavigate();
  const { licenseState, licenseDetails, daysRemaining } = useLicense();

  const getStatusColor = () => {
    switch (licenseState) {
      case "valid":
        return { bg: "rgba(56,142,60,0.08)", border: "rgba(56,142,60,0.25)", text: "var(--color-success, #388e3c)" };
      case "warning":
        return { bg: "rgba(245,124,0,0.08)", border: "rgba(245,124,0,0.25)", text: "var(--color-warning, #f57c00)" };
      case "expired_grace":
      case "locked":
      default:
        return { bg: "rgba(211,47,47,0.08)", border: "rgba(211,47,47,0.25)", text: "var(--color-error, #ba1a1a)" };
    }
  };

  const getStatusText = () => {
    switch (licenseState) {
      case "valid":
        return t("license.status.active");
      case "warning":
        return t("license.status.expiringSoon");
      case "expired_grace":
        return t("license.status.expired");
      case "locked":
      default:
        return t("license.status.locked");
    }
  };

  const colors = getStatusColor();

  return (
    <div
      style={{
        background: "var(--color-surface-container-low, rgba(255,255,255,0.02))",
        border: "1px solid rgba(208,197,175,0.18)",
        borderRadius: "var(--radius-xl)",
        padding: "20px 24px",
        boxShadow: "var(--shadow-card)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        textAlign: isRtl ? "right" : "left",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <span
            className="material-symbols-outlined filled"
            style={{ fontSize: 18, color: colors.text }}
          >
            verified
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
            {t("license.info.title")}
          </p>
        </div>

        {/* Badge */}
        {!isLoading && (
          <div
            style={{
              padding: "4px 8px",
              borderRadius: "var(--radius-sm)",
              fontSize: 10,
              fontWeight: 700,
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
              color: colors.text,
              textTransform: "uppercase",
            }}
          >
            {getStatusText()}
          </div>
        )}
      </div>

      {/* Main Details */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: isRtl ? "row-reverse" : "row",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: isRtl ? "flex-end" : "flex-start" }}>
          <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", color: "var(--color-secondary)" }}>
            {t("license.info.plan")}
          </span>
          {isLoading ? (
            <div className="skeleton" style={{ height: 18, width: 80, borderRadius: 4 }} />
          ) : (
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-on-surface)" }}>
              {licenseDetails ? t(`license.plans.${licenseDetails.plan}`) : "Non activé"}
            </span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: isRtl ? "flex-start" : "flex-end" }}>
          <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", color: "var(--color-secondary)" }}>
            {t("license.info.daysRemaining")}
          </span>
          {isLoading ? (
            <div className="skeleton" style={{ height: 18, width: 40, borderRadius: 4 }} />
          ) : (
            <span style={{ fontSize: 16, fontWeight: 800, color: licenseState === "warning" ? "var(--color-warning)" : licenseState === "locked" || licenseState === "expired_grace" ? "var(--color-danger)" : "var(--color-on-surface)" }}>
              {licenseDetails?.plan === "lifetime" ? "∞" : daysRemaining}
            </span>
          )}
        </div>
      </div>

      {/* Manage Link */}
      <div
        style={{
          borderTop: "1px solid rgba(208,197,175,0.12)",
          paddingTop: 12,
          display: "flex",
          justifyContent: isRtl ? "flex-start" : "flex-end",
        }}
      >
        <button
          type="button"
          onClick={() => navigate("/settings")}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-primary)",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: 0,
            flexDirection: isRtl ? "row-reverse" : "row",
          }}
        >
          <span>Gérer la licence</span>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            {isRtl ? "chevron_left" : "chevron_right"}
          </span>
        </button>
      </div>
    </div>
  );
}
