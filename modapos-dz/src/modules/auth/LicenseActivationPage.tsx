import { useState } from "react";
import { useLicense } from "@/contexts/LicenseContext";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";

export function LicenseActivationPage() {
  const { t, isRtl } = useTranslation();
  const { machineId, activateLicense, startTrial } = useLicense();

  const [businessName, setBusinessName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isTrial, setIsTrial] = useState(false);
  const [trialPlan, setTrialPlan] = useState<"trial7" | "trial30">("trial7");
  const [licenseKey, setLicenseKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Auto-fill defaults in dev if needed, or leave clean
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !customerName || !phone || !email) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setIsLoading(true);
    try {
      if (isTrial) {
        const ok = await startTrial(trialPlan, businessName, customerName, phone, email);
        if (ok) {
          window.location.reload();
        }
      } else {
        if (!licenseKey) {
          toast.error("Veuillez entrer votre clé de licence.");
          setIsLoading(false);
          return;
        }
        const ok = await activateLicense(
          licenseKey.trim(),
          "yearly", // we can pass yearly as default, the backend will parse the actual plan from key prefix!
          businessName,
          customerName,
          phone,
          email
        );
        if (ok) {
          window.location.reload();
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur d'activation.");
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
    toast.success("Machine ID copié !");
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
              {t("license.info.machineId")}
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
                Copier
              </button>
            </div>
            <span style={{ fontSize: "11px", color: "var(--color-outline)" }}>
              Fournissez ce code à l'administrateur pour générer votre clé.
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
              {isTrial ? t("license.activation.trial_subtitle") : t("license.activation.subtitle")}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Split Switcher */}
            <div
              className="glass-panel"
              style={{
                display: "flex",
                padding: "4px",
                borderRadius: "var(--radius-lg)",
                marginBottom: "8px",
                flexDirection: isRtl ? "row-reverse" : "row",
              }}
            >
              <button
                type="button"
                onClick={() => setIsTrial(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  backgroundColor: !isTrial ? "var(--color-primary)" : "transparent",
                  color: !isTrial ? "var(--color-on-primary)" : "var(--color-secondary)",
                }}
              >
                Clé d'activation
              </button>
              <button
                type="button"
                onClick={() => setIsTrial(true)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  backgroundColor: isTrial ? "var(--color-primary)" : "transparent",
                  color: isTrial ? "var(--color-on-primary)" : "var(--color-secondary)",
                }}
              >
                Période d'essai gratuit
              </button>
            </div>

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
                required
              />
            </div>

            {/* Owner Name */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", textAlign: isRtl ? "right" : "left" }}>
              <label
                style={{
                  fontSize: "var(--text-label-sm)",
                  fontWeight: "var(--fw-label-sm)",
                  color: "var(--color-on-surface)",
                  textTransform: "uppercase",
                }}
              >
                {t("license.activation.fields.customerName")} *
              </label>
              <input
                type="text"
                className="input-glass"
                style={{ padding: "12px 16px", borderRadius: "12px", border: "1.5px solid rgba(208,197,175,0.3)", outline: "none", width: "100%", background: "var(--color-sand)" }}
                placeholder={t("license.activation.placeholders.owner")}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>

            {/* Phone */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", textAlign: isRtl ? "right" : "left" }}>
              <label
                style={{
                  fontSize: "var(--text-label-sm)",
                  fontWeight: "var(--fw-label-sm)",
                  color: "var(--color-on-surface)",
                  textTransform: "uppercase",
                }}
              >
                {t("license.activation.fields.phone")} *
              </label>
              <input
                type="text"
                className="input-glass"
                style={{ padding: "12px 16px", borderRadius: "12px", border: "1.5px solid rgba(208,197,175,0.3)", outline: "none", width: "100%", background: "var(--color-sand)" }}
                placeholder={t("license.activation.placeholders.phone")}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", textAlign: isRtl ? "right" : "left" }}>
              <label
                style={{
                  fontSize: "var(--text-label-sm)",
                  fontWeight: "var(--fw-label-sm)",
                  color: "var(--color-on-surface)",
                  textTransform: "uppercase",
                }}
              >
                {t("license.activation.fields.email")} *
              </label>
              <input
                type="email"
                className="input-glass"
                style={{ padding: "12px 16px", borderRadius: "12px", border: "1.5px solid rgba(208,197,175,0.3)", outline: "none", width: "100%", background: "var(--color-sand)" }}
                placeholder={t("license.activation.placeholders.email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Conditionally render: Trial duration selection OR Key field */}
            {isTrial ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", textAlign: isRtl ? "right" : "left" }}>
                <label
                  style={{
                    fontSize: "var(--text-label-sm)",
                    fontWeight: "var(--fw-label-sm)",
                    color: "var(--color-on-surface)",
                    textTransform: "uppercase",
                  }}
                >
                  Durée de l'essai
                </label>
                <div style={{ display: "flex", gap: "16px", flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="trialPlan"
                      checked={trialPlan === "trial7"}
                      onChange={() => setTrialPlan("trial7")}
                      style={{ accentColor: "var(--color-primary)" }}
                    />
                    {t("license.plans.trial7")}
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="trialPlan"
                      checked={trialPlan === "trial30"}
                      onChange={() => setTrialPlan("trial30")}
                      style={{ accentColor: "var(--color-primary)" }}
                    />
                    {t("license.plans.trial30")}
                  </label>
                </div>
              </div>
            ) : (
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
                  style={{ padding: "12px 16px", borderRadius: "12px", border: "1.5px solid rgba(208,197,175,0.3)", outline: "none", width: "100%", background: "var(--color-sand)", fontFamily: "monospace" }}
                  placeholder={t("license.activation.placeholders.key")}
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  required={!isTrial}
                />
              </div>
            )}

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
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  {isTrial ? "play_arrow" : "verified"}
                </span>
                {isLoading
                  ? "Validation..."
                  : isTrial
                    ? t("license.activation.buttons.startTrial")
                    : t("license.activation.buttons.activate")}
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
