import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children?: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f6f8fb]">
      <Sidebar />

      <main className="relative flex-1 min-w-0 overflow-hidden bg-[#f6f8fb]">
        <div className="h-full overflow-y-auto">
          {children ?? <Outlet />}
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Page Header
// ─────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-20 bg-[#f6f8fb]/80 backdrop-blur-xl border-b border-neutral-200/60">
      <div className="max-w-[1600px] mx-auto px-8 py-6 flex items-start justify-between gap-6">

        <div className="min-w-0">
          <h1 className="text-[32px] font-semibold tracking-tight text-neutral-900 leading-none">
            {title}
          </h1>

          {description && (
            <p className="mt-2 text-[15px] text-neutral-500 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-3 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Page Content
// ─────────────────────────────────────────────────────────────

export function PageContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`max-w-[1600px] mx-auto w-full px-8 py-8 ${className ?? ""}`}>
      {children}
    </div>
  );
}