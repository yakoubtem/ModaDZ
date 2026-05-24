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
    <div className="flex items-end justify-between gap-6 px-8 lg:px-12 pt-10 pb-6 shrink-0 z-10 relative">
      <div className="min-w-0">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-[var(--color-text-primary)] leading-tight tracking-[-0.03em] animate-fade-fast">
          {title}
        </h1>
        {description && (
          <p className="mt-2.5 text-[15px] lg:text-[16px] text-[var(--color-text-secondary)] leading-relaxed font-medium animate-fade-fast" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-4 shrink-0 animate-fade-fast" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          {actions}
        </div>
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
    <div className={`flex-1 overflow-y-auto scrollbar-thin ${className ?? ""}`}>
      <div className="max-w-[1600px] mx-auto w-full px-8 lg:px-12 pb-12 animate-slide-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
        {children}
      </div>
    </div>
  );
}
