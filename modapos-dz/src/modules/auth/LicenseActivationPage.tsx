import { useState } from "react";
import { useLicense } from "@/contexts/LicenseContext";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";

export function LicenseActivationPage() {
  const { t, isRtl } = useTranslation();
  const { machineId, activateLicense, startTrial } = useLicense();

  const [businessName, setBusinessName] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName) {
      toast.error(isRtl ? "يرجى إدخال اسم النشاط التجاري." : "Veuillez entrer le nom de votre commerce.");
      return;
    }
    if (!licenseKey) {
      toast.error(isRtl ? "يرجى إدخال مفتاح الترخيص." : "Veuillez entrer votre clé d'activation.");
      return;
    }

    setIsLoading(true);
    try {
      const ok = await activateLicense(
        licenseKey.trim(),
        "yearly",
        businessName,
        "",
        "",
        ""
      );
      if (ok) {
        toast.success(t("license.activation.alerts.success") || "ModaDZ a été activé avec succès.");
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur d'activation.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrial = async () => {
    if (isLoading) return;

    if (!businessName) {
      toast.error(isRtl ? "يرجى إدخال اسم النشاط التجاري لتفعيل الفترة التجريبية." : "Veuillez entrer le nom du commerce pour commencer l'essai.");
      return;
    }

    setIsLoading(true);
    try {
      const ok = await startTrial("trial3", businessName, "Trial User", "0000", "");
      if (ok) {
        toast.success(t("license.activation.alerts.success") || "Période d'essai activée avec succès.");
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'activation de l'essai.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExit = () => {
    if (window.api && window.api.invoke) {
      window.api.invoke("app:quit");
    }
  };

  const copyMachineId = () => {
    navigator.clipboard.writeText(machineId);
    toast.success(isRtl ? "تم نسخ معرف الجهاز!" : "Machine ID copié !");
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        display: "flex",
        overflow: "hidden",
        background: "var(--color-background)",
        fontFamily: "var(--font-body)",
        flexDirection: isRtl ? "row-reverse" : "row",
      }}
    >
      {/* Left Panel: Brand Information */}
      <div
        style={{
          display: "none",
          width: "50%",
          position: "relative",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "40px",
          background: "rgba(228, 226, 221, 0.2)",
          overflow: "hidden",
          textAlign: isRtl ? "right" : "left",
        }}
        className="activation-left-panel"
      >
        {/* Ambient blobs */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,175,55,0.3) 0%, transparent 70%)",
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-20%",
            right: "-10%",
            width: 800,
            height: 800,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(115,92,0,0.1) 0%, transparent 70%)",
            filter: "blur(100px)",
            pointerEvents: "none",
          }}
        />

        {/* Top logo */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "12px" }}>
          <img src="/logo/ModaDZ logo.png" alt="ModaDZ Logo" style={{ height: "40px", objectFit: "contain" }} />
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-headline-md)",
              fontWeight: 600,
              color: "var(--color-on-surface)",
              letterSpacing: "-0.01em",
              margin: 0,
            }}
          >
            ModaDZ
          </h1>
        </div>

        {/* Center content */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "32px" }}>
          <div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-display-lg)",
                fontWeight: "var(--fw-display-lg)",
                lineHeight: "var(--lh-display-lg)",
                letterSpacing: "var(--ls-display-lg)",
                color: "var(--color-on-surface)",
                marginBottom: "24px",
                maxWidth: "480px",
              }}
            >
              {t("license.activation.title")}
            </h2>
            <p
              style={{
                fontSize: "var(--text-body-lg)",
                color: "var(--color-on-surface-variant)",
                maxWidth: "400px",
                lineHeight: "var(--lh-body-lg)",
              }}
            >
              {t("license.activation.subtitle")}
            </p>
          </div>

          {/* Machine ID Copy Box */}
          <div
            className="glass-login"
            style={{
              padding: "20px",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              maxWidth: "420px",
            }}
          >
            <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-secondary)" }}>
              {t("license.support.machineId") || "IDENTIFIANT MACHINE"}
            </span>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                readOnly
                value={machineId}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.5)",
                  border: "1px solid rgba(208,197,175,0.4)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "12px",
                  fontFamily: "monospace",
                  color: "var(--color-on-surface)",
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={copyMachineId}
                style={{
                  padding: "8px 16px",
                  fontSize: "12px",
                  fontWeight: 600,
                  borderRadius: "8px",
                  border: "none",
                  background: "var(--color-primary)",
                  color: "white",
                  cursor: "pointer",
                  boxShadow: "var(--shadow-gold)",
                }}
              >
                {t("license.support.copy") || "Copier"}
              </button>
            </div>
            <span style={{ fontSize: "11px", color: "var(--color-outline)" }}>
              {t("license.support.machineIdHelp") || "Utilisez cet identifiant uniquement si le support ModaDZ vous le demande."}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: "var(--text-label-sm)", letterSpacing: "var(--ls-label-sm)", color: "rgba(79,70,53,0.6)", textTransform: "uppercase" }}>
            Protection & Activation © 2026
          </p>
        </div>
      </div>

      {/* Right Panel: Activation Form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 24px",
          background: "var(--color-surface)",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: 460, display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={{ marginBottom: "32px", textAlign: isRtl ? "right" : "left" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-headline-lg)",
                fontWeight: "var(--fw-headline-lg)",
                color: "var(--color-on-surface)",
                marginBottom: "8px",
              }}
            >
              {t("license.activation.title")}
            </h2>
            <p style={{ fontSize: "var(--text-body-md)", color: "var(--color-on-surface-variant)" }}>
              {t("license.activation.subtitle")}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Business Name */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", textAlign: isRtl ? "right" : "left" }}>
              <label
                style={{
                  fontSize: "var(--text-label-sm)",
                  fontWeight: "var(--fw-label-sm)",
                  color: "var(--color-on-surface)",
                  textTransform: "uppercase",
                }}
              >
                {t("license.activation.fields.businessName")} *
              </label>
              <input
                type="text"
                className="input-glass"
                style={{ padding: "12px 16px", borderRadius: "12px", border: "1.5px solid rgba(208,197,175,0.3)", outline: "none", width: "100%", background: "var(--color-sand)" }}
                placeholder={t("license.activation.placeholders.business")}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>

            {/* License Key */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", textAlign: isRtl ? "right" : "left" }}>
              <label
                style={{
                  fontSize: "var(--text-label-sm)",
                  fontWeight: "var(--fw-label-sm)",
                  color: "var(--color-on-surface)",
                  textTransform: "uppercase",
                }}
              >
                {t("license.activation.fields.licenseKey")} *
              </label>
              <input
                type="text"
                className="input-glass"
                style={{ 
                  padding: "12px 16px", 
                  borderRadius: "12px", 
                  border: "1.5px solid rgba(208,197,175,0.3)", 
                  outline: "none", 
                  width: "100%", 
                  background: "var(--color-sand)", 
                  fontFamily: "monospace",
                  direction: "ltr",
                  textAlign: isRtl ? "right" : "left",
                  textTransform: "uppercase"
                }}
                placeholder={t("license.activation.placeholders.key")}
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "14px 24px",
                  borderRadius: "12px",
                  background: "var(--color-on-surface)",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: 700,
                  fontFamily: "var(--font-body)",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "var(--shadow-card)",
                  opacity: isLoading ? 0.7 : 1,
                  flexDirection: isRtl ? "row-reverse" : "row",
                  minHeight: "50px",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  verified
                </span>
                {isLoading
                  ? (t("license.support.loading") || "Activation en cours...")
                  : (t("license.activation.buttons.activate") || "Activer ModaDZ")}
              </button>

              <button
                type="button"
                onClick={handleTrial}
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background: "transparent",
                  color: "var(--color-primary)",
                  border: "1.5px solid var(--color-primary)",
                  fontSize: "13px",
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  flexDirection: isRtl ? "row-reverse" : "row",
                  opacity: isLoading ? 0.7 : 1,
                  minHeight: "50px",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  play_arrow
                </span>
                {t("license.activation.buttons.startTrial") || "Essayer gratuitement"}
              </button>

              <button
                type="button"
                onClick={handleExit}
                style={{
                  width: "100%",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background: "transparent",
                  color: "var(--color-danger)",
                  border: "1.5px solid var(--color-danger-subtle)",
                  fontSize: "13px",
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  flexDirection: isRtl ? "row-reverse" : "row",
                  marginTop: "8px"
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
                {t("license.activation.buttons.exit")}
              </button>
            </div>

            {/* Mobile / fallback Machine ID notice */}
            <div style={{ marginTop: "16px", gap: "6px", display: "block" }} className="activation-mobile-machineid">
              <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant)", textAlign: "center" }}>
                Machine ID: <span style={{ fontFamily: "monospace", fontWeight: "bold" }}>{machineId}</span>
              </p>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .activation-left-panel { display: flex !important; }
          .activation-mobile-machineid { display: none !important; }
        }
      `}</style>
    </div>
  );
}
