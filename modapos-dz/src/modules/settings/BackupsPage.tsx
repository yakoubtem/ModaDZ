import { BackupSettings } from "./components/BackupSettings";

export function BackupsPage() {
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
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-secondary)" }}>
          <span style={{ fontSize: "var(--text-label-sm)", fontWeight: "var(--fw-label-sm)", letterSpacing: "var(--ls-label-sm)", textTransform: "uppercase" }}>
            Administration
          </span>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
          <span style={{ fontSize: "var(--text-label-sm)", fontWeight: "var(--fw-label-sm)", letterSpacing: "var(--ls-label-sm)", textTransform: "uppercase", color: "var(--color-on-surface)" }}>
            Sauvegardes
          </span>
        </div>
      </header>

      <main
        style={{
          flex: 1,
          padding: "var(--space-container)",
          maxWidth: 1080,
          width: "100%",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ marginBottom: "var(--space-section)" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-headline-lg)",
              fontWeight: "var(--fw-headline-lg)",
              color: "var(--color-on-surface)",
              marginBottom: "8px",
            }}
          >
            Sauvegardes et Restauration
          </h2>
          <p style={{ fontSize: "var(--text-body-lg)", color: "var(--color-on-surface-variant)", maxWidth: 640, lineHeight: "var(--lh-body-lg)" }}>
            Gérez la sécurité de vos données en créant, exportant ou restaurant des sauvegardes du système.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: "24px", borderRadius: "var(--radius-xl)" }}>
          <BackupSettings />
        </div>
      </main>
    </div>
  );
}
