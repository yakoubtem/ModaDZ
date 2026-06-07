import { useState } from "react";
import { GeneralSettings } from "./components/GeneralSettings";
import { BackupSettings } from "./components/BackupSettings";
import { UsersSettings } from "../users/UsersSettings";
import { useAuth } from "@/modules/auth/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";

type Tab = "general" | "backup" | "users";

const TABS: { id: Tab; icon: string; adminOnly?: boolean }[] = [
  { id: "general",  icon: "store" },
  { id: "backup",   icon: "hard_drive" },
  { id: "users",    icon: "shield",   adminOnly: true },
];

export function SettingsPage() {
  const { can } = useAuth();
  const { t, isRtl } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>("general");

  const getTabLabel = (id: Tab) => {
    switch (id) {
      case "general": return t("settings.tabs.store");
      case "backup": return t("settings.tabs.backup");
      case "users": return t("settings.tabs.users");
      default: return "";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Custom top bar — Settings breadcrumb */}
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
            {t("settings.breadcrumbs.global_config")}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button className="btn-checkout">{t("common.buttons.checkout")}</button>
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
        {/* Page header */}
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
            {t("settings.title")}
          </h2>
          <p style={{ fontSize: "var(--text-body-lg)", color: "var(--color-on-surface-variant)", maxWidth: 640, lineHeight: "var(--lh-body-lg)", marginBottom: "32px" }}>
            {t("settings.description")}
          </p>

          {/* Tab underline navigation */}
          <div style={{ display: "flex", gap: "32px", borderBottom: "1px solid rgba(208,197,175,0.3)", flexDirection: isRtl ? "row-reverse" : "row" }}>
            {TABS.map((tab) => {
              if (tab.adminOnly && !can("users.manage")) return null;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    paddingBottom: "16px",
                    fontSize: "var(--text-label-md)",
                    fontWeight: "var(--fw-label-md)",
                    letterSpacing: "var(--ls-label-md)",
                    fontFamily: "var(--font-body)",
                    background: "none",
                    border: "none",
                    borderBottom: `2px solid ${isActive ? "var(--color-primary)" : "transparent"}`,
                    color: isActive ? "var(--color-primary)" : "var(--color-secondary)",
                    cursor: "pointer",
                    marginBottom: -1,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "color 0.2s, border-color 0.2s",
                    flexDirection: isRtl ? "row-reverse" : "row",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{tab.icon}</span>
                  {getTabLabel(tab.id)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bento grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "8fr 4fr",
            gap: "var(--space-card-gap)",
          }}
        >
          {/* Main content column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-card-gap)" }}>
            {activeTab === "general" && <GeneralSettings />}
            {activeTab === "backup" && <BackupSettings />}
            {activeTab === "users" && can("users.manage") && <UsersSettings />}
          </div>

          {/* Sticky actions + tip column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-card-gap)" }}>
            <div
              style={{
                position: "sticky",
                top: 100,
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-card-gap)",
              }}
            >
              {/* Save card */}
              <div
                style={{
                  background: "var(--color-surface-container-low)",
                  border: "1px solid rgba(208,197,175,0.3)",
                  borderRadius: "var(--radius-xl)",
                  padding: "24px",
                  textAlign: isRtl ? "right" : "left",
                }}
              >
                <h3
                  style={{
                    fontSize: "var(--text-label-md)",
                    fontWeight: "var(--fw-label-md)",
                    letterSpacing: "var(--ls-label-md)",
                    color: "var(--color-on-surface)",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  {t("settings.pending_changes.title")}
                </h3>
                <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-on-surface-variant)", marginBottom: "24px" }}>
                  {t("settings.pending_changes.desc")}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <button className="btn-primary" style={{ justifyContent: "center", width: "100%", padding: "16px" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span>
                    {t("settings.pending_changes.save_btn")}
                  </button>
                  <button className="btn-border" style={{ justifyContent: "center", width: "100%", padding: "12px" }}>
                    {t("settings.pending_changes.cancel_btn")}
                  </button>
                </div>
              </div>

              {/* Tip card */}
              <div
                style={{
                  background: "rgba(212,175,55,0.08)",
                  border: "1px solid rgba(115,92,0,0.2)",
                  borderRadius: "var(--radius-xl)",
                  padding: "24px",
                  position: "relative",
                  overflow: "hidden",
                  textAlign: isRtl ? "right" : "left",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    right: isRtl ? "auto" : -32,
                    left: isRtl ? -32 : "auto",
                    top: -32,
                    width: 96,
                    height: 96,
                    background: "rgba(115,92,0,0.2)",
                    filter: "blur(24px)",
                    borderRadius: "50%",
                    pointerEvents: "none",
                  }}
                />
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", position: "relative", flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <span className="material-symbols-outlined" style={{ color: "var(--color-primary)", marginTop: 2, flexShrink: 0 }}>lightbulb</span>
                  <div>
                    <h4 style={{ fontSize: "var(--text-label-md)", fontWeight: "var(--fw-label-md)", letterSpacing: "var(--ls-label-md)", color: "var(--color-on-surface)", marginBottom: "4px" }}>
                      {t("settings.tip.title")}
                    </h4>
                    <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-on-surface-variant)", lineHeight: "var(--lh-body-sm)" }}>
                      {t("settings.tip.desc")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}