import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useLicense } from "@/contexts/LicenseContext";
import { useTranslation } from "@/hooks/useTranslation";

interface AppLayoutProps {
  children?: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { licenseState, daysRemaining, graceDaysRemaining } = useLicense();
  const { t } = useTranslation();

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        {licenseState === "expired_grace" && (
          <div
            style={{
              background: "rgba(186,26,26,0.9)",
              color: "white",
              padding: "12px 24px",
              textAlign: "center",
              fontSize: 14,
              fontWeight: 600,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              borderBottom: "1px solid rgba(186,26,26,0.3)",
              zIndex: 100,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>warning</span>
            <span>
              {t("license.banners.expired_grace", { days: graceDaysRemaining || 0 })}
            </span>
          </div>
        )}

        {licenseState === "warning" && (
          <div
            style={{
              background: "rgba(212,175,55,0.95)",
              color: "#1e1810",
              padding: "10px 24px",
              textAlign: "center",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              borderBottom: "1px solid rgba(212,175,55,0.3)",
              zIndex: 100,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>info</span>
            <span>
              {t("license.banners.warning", { days: daysRemaining })}
            </span>
          </div>
        )}

        <div className="main-scroll">
          {children ?? <Outlet />}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Top App Bar — matches Stitch header across all pages
// ─────────────────────────────────────────────────────────────

interface TopBarProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
}

export function TopBar({ title, description, actions }: TopBarProps) {
  return (
    <header className="top-bar" style={{ width: "100%" }}>
      <div>
        {title && (
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-headline-lg)",
              lineHeight: "var(--lh-headline-lg)",
              fontWeight: "var(--fw-headline-lg)",
              color: "var(--color-on-surface)",
            }}
          >
            {title}
          </h2>
        )}
        {description && (
          <p
            style={{
              marginTop: "4px",
              fontSize: "var(--text-body-md)",
              color: "var(--color-secondary)",
            }}
          >
            {description}
          </p>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        {actions}
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────
// Page Content wrapper
// ─────────────────────────────────────────────────────────────

export function PageContent({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`page-content ${className}`}
      style={{ paddingTop: "32px" }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PageHeader — backward-compat alias for TopBar
// ─────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return <TopBar title={title} description={description} actions={actions} />;
}