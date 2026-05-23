import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children?: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-full w-full overflow-hidden bg-[var(--color-bg-base)]">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}

// ── Page Header ──────────────────────────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-6 px-6 lg:px-8 py-5 lg:py-6 border-b border-[var(--color-border)] shrink-0 bg-[var(--color-bg-surface)] shadow-[0_1px_0_0_var(--color-border)]">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] leading-tight tracking-[-0.02em]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-[14px] text-[var(--color-text-secondary)] leading-snug font-normal">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0">{actions}</div>
      )}
    </div>
  );
}

// ── Page Content Wrapper ─────────────────────────────────────────────────────
export function PageContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex-1 overflow-y-auto ${className ?? ""}`}>
      <div className="max-w-[1600px] mx-auto w-full px-6 lg:px-8 py-6 lg:py-8">
        {children}
      </div>
    </div>
  );
}
