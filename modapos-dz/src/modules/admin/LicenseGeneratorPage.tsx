import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/modules/auth/AuthContext";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";

export function LicenseGeneratorPage() {
  const { t, isRtl } = useTranslation();
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<"trial7" | "trial30" | "monthly" | "yearly" | "lifetime">("yearly");
  const [expiryDate, setExpiryDate] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Set default expiry date based on plan
  useEffect(() => {
    const offsetDays = {
      trial7: 7,
      trial30: 30,
      monthly: 30,
      yearly: 365,
      lifetime: 36500, // ~100 years
    }[plan];

    const exp = new Date();
    exp.setDate(exp.getDate() + offsetDays);
    setExpiryDate(exp.toISOString().split("T")[0]);
  }, [plan]);

  // Route protection - admin only
  if (!user || user.role !== "admin") {
    return <Navigate to="/access-denied" replace />;
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expiryDate) {
      toast.error("Veuillez choisir une date d'expiration.");
      return;
    }

    setIsGenerating(true);
    try {
      if (window.api && window.api.invoke) {
        const res = (await window.api.invoke("license:generateKey", {
          plan,
          expiryDate: new Date(expiryDate).toISOString(),
        })) as { success: boolean; licenseKey?: string; error?: string };

        if (res.success && res.licenseKey) {
          setGeneratedKey(res.licenseKey);
          toast.success("Clé de licence générée !");
        } else {
          toast.error(res.error || "Échec de génération de la clé.");
        }
      } else {
        toast.error("API Electron indisponible.");
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur de génération.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    toast.success("Clé copiée dans le presse-papiers !");
  };

  const handlePrint = () => {
    if (!generatedKey) return;
    window.print();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-background)",
        fontFamily: "var(--font-body)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top Header */}
      <header
        className="no-print"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(251,249,244,0.6)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px var(--space-container)",
          borderBottom: "1px solid rgba(208,197,175,0.2)",
          flexDirection: isRtl ? "row-reverse" : "row",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-secondary)" }}>
          <span style={{ fontSize: "var(--text-label-sm)", fontWeight: "var(--fw-label-sm)", letterSpacing: "var(--ls-label-sm)", textTransform: "uppercase" }}>
            Administration
          </span>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            {isRtl ? "chevron_left" : "chevron_right"}
          </span>
          <span style={{ fontSize: "var(--text-label-sm)", fontWeight: "var(--fw-label-sm)", letterSpacing: "var(--ls-label-sm)", textTransform: "uppercase", color: "var(--color-on-surface)" }}>
            Générateur de Clés
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main
        className="no-print"
        style={{
          flex: 1,
          padding: "var(--space-container)",
          maxWidth: 1000,
          width: "100%",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Page title */}
        <div style={{ textAlign: isRtl ? "right" : "left" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-headline-lg)",
              fontWeight: "var(--fw-headline-lg)",
              color: "var(--color-on-surface)",
              marginBottom: "8px",
            }}
          >
            {t("license.generator.title")}
          </h2>
          <p style={{ fontSize: "var(--text-body-lg)", color: "var(--color-on-surface-variant)" }}>
            {t("license.generator.subtitle")}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-card-gap)" }}>
          {/* Form Card */}
          <form
            onSubmit={handleGenerate}
            style={{
              background: "var(--color-surface-container-low)",
              padding: "28px",
              borderRadius: "var(--radius-xl)",
              border: "1px solid rgba(208,197,175,0.3)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              textAlign: isRtl ? "right" : "left",
            }}
          >
            {/* Customer Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "var(--text-label-md)", fontWeight: "var(--fw-label-md)", color: "var(--color-secondary)" }}>
                {t("license.generator.fields.customer")} *
              </label>
              <input
                type="text"
                required
                className="input-glass"
                style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(208,197,175,0.4)", outline: "none", width: "100%", background: "var(--color-surface)" }}
                placeholder="Ex. Mohamed El-Amine"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "var(--text-label-md)", fontWeight: "var(--fw-label-md)", color: "var(--color-secondary)" }}>
                {t("license.activation.fields.businessName")} *
              </label>
              <input
                type="text"
                required
                className="input-glass"
                style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(208,197,175,0.4)", outline: "none", width: "100%", background: "var(--color-surface)" }}
                placeholder="Ex. ModaDZ Boutique"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "var(--text-label-md)", fontWeight: "var(--fw-label-md)", color: "var(--color-secondary)" }}>
                  Téléphone
                </label>
                <input
                  type="text"
                  className="input-glass"
                  style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(208,197,175,0.4)", outline: "none", width: "100%", background: "var(--color-surface)" }}
                  placeholder="0555 12 34 56"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "var(--text-label-md)", fontWeight: "var(--fw-label-md)", color: "var(--color-secondary)" }}>
                  E-mail
                </label>
                <input
                  type="email"
                  className="input-glass"
                  style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(208,197,175,0.4)", outline: "none", width: "100%", background: "var(--color-surface)" }}
                  placeholder="support@client.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Plan selection */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "var(--text-label-md)", fontWeight: "var(--fw-label-md)", color: "var(--color-secondary)" }}>
                {t("license.generator.fields.plan")}
              </label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value as any)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid rgba(208,197,175,0.4)",
                  borderRadius: "10px",
                  background: "var(--color-surface)",
                  color: "var(--color-on-surface)",
                  fontSize: 14,
                  outline: "none",
                }}
              >
                <option value="trial7">{t("license.plans.trial7")}</option>
                <option value="trial30">{t("license.plans.trial30")}</option>
                <option value="monthly">{t("license.plans.monthly")}</option>
                <option value="yearly">{t("license.plans.yearly")}</option>
                <option value="lifetime">{t("license.plans.lifetime")}</option>
              </select>
            </div>

            {/* Expiration Date */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "var(--text-label-md)", fontWeight: "var(--fw-label-md)", color: "var(--color-secondary)" }}>
                {t("license.generator.fields.expiryDate")}
              </label>
              <input
                type="date"
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid rgba(208,197,175,0.4)",
                  borderRadius: "10px",
                  background: "var(--color-surface)",
                  color: "var(--color-on-surface)",
                  fontSize: 14,
                  outline: "none",
                }}
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="btn-primary"
              style={{ justifyContent: "center", width: "100%", padding: "14px", marginTop: "10px" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>key</span>
              {isGenerating ? "Génération..." : t("license.generator.buttons.generate")}
            </button>
          </form>

          {/* Key Output Card */}
          <div
            style={{
              background: "var(--color-surface-container-low)",
              padding: "28px",
              borderRadius: "var(--radius-xl)",
              border: "1px solid rgba(208,197,175,0.3)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "24px",
              textAlign: isRtl ? "right" : "left",
            }}
          >
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--color-on-surface)", fontFamily: "var(--font-display)", marginBottom: 8 }}>
                Clé de Licence Générée
              </h3>
              <p style={{ fontSize: 13, color: "var(--color-secondary)", lineHeight: "1.4" }}>
                Voici la clé cryptographique générée. Elle est signée et valide uniquement pour le plan et la date spécifiés.
              </p>
            </div>

            {generatedKey ? (
              <div
                style={{
                  background: "rgba(212,175,55,0.08)",
                  border: "1px dashed rgba(115,92,0,0.3)",
                  borderRadius: "12px",
                  padding: "24px 16px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "monospace", letterSpacing: 1.5, color: "var(--color-primary)", userSelect: "all" }}>
                  {generatedKey}
                </span>
              </div>
            ) : (
              <div
                style={{
                  border: "1px dashed rgba(208,197,175,0.4)",
                  borderRadius: "12px",
                  padding: "32px 16px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "var(--color-secondary)",
                  fontSize: 13,
                }}
              >
                Remplissez les détails et générez une clé.
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", flexDirection: isRtl ? "row-reverse" : "row" }}>
              <button
                type="button"
                className="btn-border"
                disabled={!generatedKey}
                onClick={copyToClipboard}
                style={{ flex: 1, justifyContent: "center", padding: "12px" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>content_copy</span>
                {t("license.generator.buttons.copy")}
              </button>

              <button
                type="button"
                className="btn-primary"
                disabled={!generatedKey}
                onClick={handlePrint}
                style={{ flex: 1, justifyContent: "center", padding: "12px" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>print</span>
                {t("license.generator.buttons.export")}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Print-only Certificate Sheet */}
      {generatedKey && (
        <div
          className="print-only"
          style={{
            display: "none",
            width: "210mm",
            minHeight: "297mm",
            background: "#fff",
            color: "#000",
            padding: "25mm 20mm",
            boxSizing: "border-box",
            fontFamily: "serif",
          }}
        >
          {/* Certificate Boarder Frame */}
          <div
            style={{
              border: "10px double #bf9b30",
              padding: "20mm 15mm",
              height: "calc(100% - 20px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              textAlign: "center",
              position: "relative",
            }}
          >
            {/* Corners */}
            <div style={{ position: "absolute", top: 10, left: 10, fontSize: 18, color: "#bf9b30" }}>◆</div>
            <div style={{ position: "absolute", top: 10, right: 10, fontSize: 18, color: "#bf9b30" }}>◆</div>
            <div style={{ position: "absolute", bottom: 10, left: 10, fontSize: 18, color: "#bf9b30" }}>◆</div>
            <div style={{ position: "absolute", bottom: 10, right: 10, fontSize: 18, color: "#bf9b30" }}>◆</div>

            <div>
              <h1 style={{ fontSize: 32, letterSpacing: 3, fontWeight: 700, margin: "0 0 10px 0", color: "#8c6f1a" }}>
                {t("license.generator.pdf.title")}
              </h1>
              <div style={{ width: 120, height: 2, background: "#bf9b30", margin: "10px auto 30px" }} />

              <p style={{ fontSize: 16, fontStyle: "italic", color: "#555", margin: "20px 0 40px" }}>
                {t("license.generator.pdf.desc")}
              </p>

              {/* Details grid */}
              <table style={{ width: "90%", margin: "0 auto 40px", borderCollapse: "collapse", textAlign: "left", fontSize: 15 }}>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "12px", fontWeight: "bold", width: "40%" }}>{t("license.generator.pdf.client", { client: "" }).replace(":", "")}</td>
                    <td style={{ padding: "12px" }}>{customerName} {businessName ? `(${businessName})` : ""}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "12px", fontWeight: "bold" }}>{t("license.generator.pdf.plan", { plan: "" }).replace(":", "")}</td>
                    <td style={{ padding: "12px", textTransform: "capitalize" }}>{t(`license.plans.${plan}`)}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "12px", fontWeight: "bold" }}>{t("license.generator.pdf.expiry", { expiry: "" }).replace(":", "")}</td>
                    <td style={{ padding: "12px" }}>{new Date(expiryDate).toLocaleDateString()}</td>
                  </tr>
                  {phone && (
                    <tr style={{ borderBottom: "1px solid #ddd" }}>
                      <td style={{ padding: "12px", fontWeight: "bold" }}>Téléphone</td>
                      <td style={{ padding: "12px" }}>{phone}</td>
                    </tr>
                  )}
                  {email && (
                    <tr style={{ borderBottom: "1px solid #ddd" }}>
                      <td style={{ padding: "12px", fontWeight: "bold" }}>E-mail</td>
                      <td style={{ padding: "12px" }}>{email}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Key Frame */}
              <div
                style={{
                  border: "2px solid #bf9b30",
                  background: "#fdfbf7",
                  padding: "20px 10px",
                  margin: "40px auto 40px",
                  width: "90%",
                }}
              >
                <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, color: "#666", marginBottom: 8 }}>
                  Clé d'activation officielle
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "monospace", color: "#000", letterSpacing: 2 }}>
                  {generatedKey}
                </div>
              </div>
            </div>

            {/* Terms and instructions */}
            <div style={{ fontSize: 12, color: "#666", textAlign: "left", padding: "0 15px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
              <p style={{ fontWeight: "bold", margin: "0 0 5px 0" }}>{t("license.generator.pdf.instruction")}</p>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Cette clé de licence est valide pour un seul ordinateur (Machine ID).</li>
                <li>Toute modification matérielle majeure peut nécessiter un renouvellement gratuit de la clé.</li>
                <li>Conservez ce certificat dans un endroit sûr.</li>
              </ul>
            </div>

            <div style={{ marginTop: "30px", fontSize: 11, color: "#999" }}>
              Émis automatiquement par le système d'administration de ModaDZ · Date : {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for Printing A4 */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
}
