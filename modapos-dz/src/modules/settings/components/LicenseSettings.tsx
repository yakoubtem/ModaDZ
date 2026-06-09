import { useState } from "react";
import { useLicense } from "@/contexts/LicenseContext";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";

export function LicenseSettings() {
  const { t, isRtl } = useTranslation();
  const {
    licenseState,
    licenseDetails,
    daysRemaining,
    graceDaysRemaining,
    machineId,
    activateLicense,
  } = useLicense();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopyMachineId = () => {
    navigator.clipboard.writeText(machineId);
    toast.success("Machine ID copié !");
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) {
      toast.error("Veuillez entrer une clé de licence valide.");
      return;
    }

    setIsSubmitting(true);
    try {
      const bizName = licenseDetails?.businessName || "";
      const custName = licenseDetails?.customerName || "";
      const phone = licenseDetails?.phone || "";
      const email = licenseDetails?.email || "";

      const ok = await activateLicense(
        newKey.trim(),
        "yearly", // backend automatically extracts actual plan from the key
        bizName,
        custName,
        phone,
        email
      );

      if (ok) {
        setIsModalOpen(false);
        setNewKey("");
        // Reload after success to refresh state
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur de renouvellement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = () => {
    switch (licenseState) {
      case "valid":
        return { bg: "rgba(56,142,60,0.08)", border: "rgba(56,142,60,0.3)", text: "var(--color-success, #388e3c)" };
      case "warning":
        return { bg: "rgba(245,124,0,0.08)", border: "rgba(245,124,0,0.3)", text: "var(--color-warning, #f57c00)" };
      case "expired_grace":
        return { bg: "rgba(211,47,47,0.08)", border: "rgba(211,47,47,0.3)", text: "var(--color-danger, #d32f2f)" };
      case "locked":
      default:
        return { bg: "rgba(211,47,47,0.12)", border: "rgba(211,47,47,0.4)", text: "var(--color-error, #ba1a1a)" };
    }
  };

  const getStatusLabel = () => {
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

  const maskKey = (key: string) => {
    if (!key) return "";
    const parts = key.split("-");
    if (parts.length >= 4) {
      return `${parts[0]}-${parts[1]}-${parts[2]}-XXXX-XXXX`;
    }
    return key;
  };

  const formatPlan = (plan?: string) => {
    if (!plan) return "-";
    return t(`license.plans.${plan}`);
  };

  const colors = getStatusColor();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Main License Card */}
      <div
        style={{
          background: "var(--color-surface-container-low)",
          padding: 28,
          borderRadius: "var(--radius-xl)",
          border: "1px solid rgba(208,197,175,0.3)",
          display: "flex",
          flexDirection: "column",
          gap: 24,
          textAlign: isRtl ? "right" : "left",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexDirection: isRtl ? "row-reverse" : "row" }}>
          <div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "var(--color-on-surface)",
                fontFamily: "var(--font-display)",
                marginBottom: 4,
              }}
            >
              {t("license.info.title")}
            </h3>
            <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)" }}>
              {t("license.subtitle")}
            </p>
          </div>

          <div
            style={{
              padding: "6px 12px",
              borderRadius: "var(--radius-md)",
              fontSize: 12,
              fontWeight: 700,
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
              color: colors.text,
              textTransform: "uppercase",
            }}
          >
            {getStatusLabel()}
          </div>
        </div>

        {licenseDetails ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 20,
            }}
          >
            {/* Business info */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "var(--color-secondary)" }}>
                {t("license.info.business")}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-on-surface)" }}>
                {licenseDetails.businessName}
              </span>
            </div>

            {/* Owner info */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "var(--color-secondary)" }}>
                {t("license.info.owner")}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-on-surface)" }}>
                {licenseDetails.customerName}
              </span>
            </div>

            {/* Key info */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "var(--color-secondary)" }}>
                {t("license.info.key")}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-on-surface)", fontFamily: "monospace" }}>
                {maskKey(licenseDetails.licenseKey)}
              </span>
            </div>

            {/* Plan info */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "var(--color-secondary)" }}>
                {t("license.info.plan")}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-on-surface)" }}>
                {formatPlan(licenseDetails.plan)}
              </span>
            </div>

            {/* Activated At */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "var(--color-secondary)" }}>
                {t("license.info.activatedAt")}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-on-surface)" }}>
                {new Date(licenseDetails.activatedAt).toLocaleDateString()}
              </span>
            </div>

            {/* Expires At */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "var(--color-secondary)" }}>
                {t("license.info.expiresAt")}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-on-surface)" }}>
                {licenseDetails.plan === "lifetime"
                  ? t("license.info.never")
                  : new Date(licenseDetails.expiresAt).toLocaleDateString()}
              </span>
            </div>

            {/* Days Remaining */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "var(--color-secondary)" }}>
                {t("license.info.daysRemaining")}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: licenseState === "warning" ? "var(--color-warning)" : licenseState === "locked" || licenseState === "expired_grace" ? "var(--color-danger)" : "var(--color-on-surface)" }}>
                {licenseDetails.plan === "lifetime"
                  ? t("license.info.never")
                  : licenseState === "expired_grace"
                  ? `0 (${graceDaysRemaining} jours grâce)`
                  : t("license.info.days", { count: daysRemaining })}
              </span>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 14, color: "var(--color-secondary)" }}>
            Aucune information de licence disponible. Veuillez activer le produit.
          </p>
        )}

        <div style={{ display: "flex", justifyContent: isRtl ? "flex-start" : "flex-end" }}>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setIsModalOpen(true)}
            style={{ padding: "12px 24px", justifyContent: "center" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>refresh</span>
            {t("license.info.renewBtn")}
          </button>
        </div>
      </div>

      {/* Machine ID Box */}
      <div
        style={{
          background: "var(--color-surface-container-low)",
          padding: 28,
          borderRadius: "var(--radius-xl)",
          border: "1px solid rgba(208,197,175,0.3)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          textAlign: isRtl ? "right" : "left",
        }}
      >
        <div>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--color-on-surface)",
              fontFamily: "var(--font-display)",
              marginBottom: 4,
            }}
          >
            {t("license.info.machineId")}
          </h3>
          <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)" }}>
            Identifiant matériel unique de cet ordinateur.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", maxWidth: 500, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <input
            type="text"
            readOnly
            value={machineId}
            style={{
              flex: 1,
              padding: "10px 14px",
              border: "1px solid rgba(208,197,175,0.4)",
              borderRadius: "var(--radius-lg)",
              background: "var(--color-surface)",
              color: "var(--color-on-surface)",
              fontSize: 13,
              fontFamily: "monospace",
              outline: "none",
            }}
          />
          <button
            type="button"
            className="btn-border"
            onClick={handleCopyMachineId}
            style={{ padding: "10px 16px", marginBottom: 0, justifyContent: "center" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>content_copy</span>
            Copier
          </button>
        </div>
      </div>

      {/* Renewal Dialog Modal */}
      {isModalOpen && (
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
            onClick={() => setIsModalOpen(false)}
          />

          {/* Dialog Container */}
          <form
            onSubmit={handleRenewSubmit}
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
                }}
              >
                {t("license.info.renewTitle")}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
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
              <p style={{ fontSize: 13, color: "var(--color-secondary)", lineHeight: "1.4" }}>
                {t("license.info.renewDesc")}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  style={{
                    fontSize: "var(--text-label-md)",
                    fontWeight: "var(--fw-label-md)",
                    color: "var(--color-secondary)",
                  }}
                >
                  {t("license.activation.fields.licenseKey")}
                </label>
                <input
                  type="text"
                  required
                  placeholder="MDZ-PRO-XXXX-XXXX-XXXX"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid rgba(208,197,175,0.4)",
                    borderRadius: "var(--radius-lg)",
                    background: "var(--color-surface)",
                    color: "var(--color-on-surface)",
                    fontSize: 14,
                    outline: "none",
                    fontFamily: "monospace",
                    textAlign: isRtl ? "right" : "left",
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
              <button
                type="button"
                className="btn-border"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                style={{ marginBottom: 0 }}
              >
                {t("common.buttons.cancel")}
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={{ marginBottom: 0 }}
              >
                {isSubmitting ? "Activation..." : t("license.info.renewSubmit")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
