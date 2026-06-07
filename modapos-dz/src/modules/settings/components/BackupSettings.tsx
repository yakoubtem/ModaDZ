import { useBackups } from "../hooks/useBackups";
import { useTranslation } from "@/hooks/useTranslation";

export function BackupSettings() {
  const { backups, isLoading, createBackup, restoreBackup, exportBackup } = useBackups();
  const { t, isRtl } = useTranslation();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Create backup card */}
      <div
        style={{
          background: "var(--color-surface-container-low)",
          padding: 28,
          borderRadius: "var(--radius-xl)",
          border: "1px solid rgba(208,197,175,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 240, textAlign: isRtl ? "right" : "left" }}>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--color-on-surface)",
              fontFamily: "var(--font-display)",
              marginBottom: 6,
            }}
          >
            {t("settings.backups.create_btn")}
          </h3>
          <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)", lineHeight: "var(--lh-body-sm)" }}>
            {t("settings.backups.desc")}
          </p>
        </div>
        <button className="btn-primary" onClick={() => createBackup()} style={{ flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>backup</span>
          {t("settings.backups.new_backup")}
        </button>
      </div>

      {/* Backup history */}
      <div
        style={{
          borderRadius: "var(--radius-xl)",
          border: "1px solid rgba(208,197,175,0.3)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid rgba(208,197,175,0.3)",
            background: "rgba(245,243,238,0.7)",
            textAlign: isRtl ? "right" : "left",
          }}
        >
          <h3
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--color-on-surface)",
              fontFamily: "var(--font-display)",
            }}
          >
            {t("settings.backups.list_title")}
          </h3>
        </div>

        {isLoading ? (
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 52, borderRadius: 8 }} />
            ))}
          </div>
        ) : backups.length === 0 ? (
          <div
            style={{
              padding: "64px 24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--color-outline)", opacity: 0.5 }}>
              cloud_off
            </span>
            <p style={{ fontSize: "var(--text-body-md)", color: "var(--color-secondary)" }}>
              {t("settings.backups.empty")}
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-body-sm)" }}>
            <thead>
              <tr style={{ background: "rgba(245,243,238,0.4)", borderBottom: "1px solid rgba(208,197,175,0.2)" }}>
                {["filename", "date", "size", "actions"].map((key) => (
                  <th
                    key={key}
                    style={{
                      padding: "14px 20px",
                      textAlign: key === "actions" ? (isRtl ? "left" : "right") : (isRtl ? "right" : "left"),
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--color-secondary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t("settings.backups.table." + key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {backups.map((backup) => (
                <tr
                  key={backup.id}
                  style={{
                    borderBottom: "1px solid rgba(208,197,175,0.15)",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(212,175,55,0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Filename */}
                  <td style={{ padding: "14px 20px", fontWeight: 500, color: "var(--color-on-surface)", textAlign: isRtl ? "right" : "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-secondary)" }}>
                        description
                      </span>
                      <span>{backup.filename}</span>
                    </div>
                  </td>

                  {/* Date */}
                  <td style={{ padding: "14px 20px", fontSize: 12, color: "var(--color-secondary)", textAlign: isRtl ? "right" : "left" }}>
                    {new Date(backup.createdAt).toLocaleString(isRtl ? "ar-DZ" : "fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>

                  {/* Size */}
                  <td style={{ padding: "14px 20px", fontSize: 12, color: "var(--color-secondary)", fontVariantNumeric: "tabular-nums", textAlign: isRtl ? "right" : "left" }}>
                    {(backup.size / 1024).toFixed(2)} KB
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "14px 20px", textAlign: isRtl ? "left" : "right" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: isRtl ? "flex-start" : "flex-end", flexDirection: isRtl ? "row-reverse" : "row" }}>
                      <button
                        className="btn-border"
                        onClick={() => exportBackup(backup.id, backup.filename)}
                        style={{ padding: "6px 14px", fontSize: 12, height: 36, gap: 6 }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>download</span>
                        {t("settings.backups.export_btn")}
                      </button>
                      <button
                        className="btn-border"
                        onClick={() => restoreBackup(backup.id, backup.filename)}
                        style={{ padding: "6px 14px", fontSize: 12, height: 36, gap: 6 }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>restore</span>
                        {t("settings.backups.restore_btn")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}