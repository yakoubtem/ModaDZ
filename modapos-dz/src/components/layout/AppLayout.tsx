import type { ReactNode } from "react";
// PageHeader is an alias for TopBar maintained for backward compatibility
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children?: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
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
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button className="top-bar-icon-btn">
            <span className="material-symbols-outlined">search</span>
          </button>
          <button className="top-bar-icon-btn">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="top-bar-icon-btn">
            <span className="material-symbols-outlined">help</span>
          </button>
        </div>

        {actions ?? (
          <button className="btn-checkout">Check Out</button>
        )}
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