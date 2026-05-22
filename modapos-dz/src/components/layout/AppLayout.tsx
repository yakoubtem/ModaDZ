import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children?: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[var(--color-bg-base)]">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}

// ─── Page Header ───────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-8 py-6 border-b border-[var(--color-border)] shrink-0">
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
          {title}
        </h1>
        {description && (
          <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}

// ─── Page Content Wrapper ──────────────────────────────────
export function PageContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex-1 overflow-y-auto px-8 py-6 ${className ?? ""}`}>
      {children}
    </div>
  );
}
