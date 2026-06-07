import { BackupSettings } from "./components/BackupSettings";
import { useTranslation } from "@/hooks/useTranslation";

export function BackupsPage() {
  const { t, isRtl } = useTranslation();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Custom top bar */}
      <header
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
          padding: "var(--space-gutter) var(--space-container)",
          borderBottom: "1px solid rgba(208,197,175,0.2)",
          flexDirection: isRtl ? "row-reverse" : "row",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-secondary)" }}>
          <span style={{ fontSize: "var(--text-label-sm)", fontWeight: "var(--fw-label-sm)", letterSpacing: "var(--ls-label-sm)", textTransform: "uppercase" }}>
            {t("settings.breadcrumbs.admin")}
          </span>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            {isRtl ? "chevron_left" : "chevron_right"}
          </span>
          <span style={{ fontSize: "var(--text-label-sm)", fontWeight: "var(--fw-label-sm)", letterSpacing: "var(--ls-label-sm)", textTransform: "uppercase", color: "var(--color-on-surface)" }}>
            {t("common.sidebar.backups")}
          </span>
        </div>
      </header>

      <main
        style={{
          flex: 1,
          padding: "var(--space-container)",
          maxWidth: 1440,
          width: "100%",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ marginBottom: "var(--space-section)", textAlign: isRtl ? "right" : "left" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-headline-lg)",
              fontWeight: "var(--fw-headline-lg)",
              color: "var(--color-on-surface)",
              marginBottom: "8px",
            }}
          >
            {t("settings.backups.title")}
          </h2>
          <p style={{ fontSize: "var(--text-body-lg)", color: "var(--color-on-surface-variant)", maxWidth: 640, lineHeight: "var(--lh-body-lg)" }}>
            {t("settings.backups.desc")}
          </p>
        </div>

        <div className="glass-panel" style={{ padding: "24px", borderRadius: "var(--radius-xl)" }}>
          <BackupSettings />
        </div>
      </main>
    </div>
  );
}
