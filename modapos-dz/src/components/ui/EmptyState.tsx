import type { LucideIcon, LucideProps } from "lucide-react";
import { PackageSearch, SearchX, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type EmptyVariant = "default" | "search" | "error";

interface EmptyStateProps {
  variant?: EmptyVariant;
  /** Override the default icon for this variant */
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const DEFAULT_ICONS: Record<EmptyVariant, LucideIcon> = {
  default: PackageSearch,
  search: SearchX,
  error: AlertCircle,
};

const ICON_COLORS: Record<EmptyVariant, string> = {
  default: "text-[var(--color-accent)]",
  search: "text-[var(--color-text-secondary)]",
  error: "text-[var(--color-danger)]",
};

const ICON_BG: Record<EmptyVariant, string> = {
  default: "bg-[var(--color-accent-subtle)] border-[var(--color-accent-border)]",
  search: "bg-[var(--color-bg-elevated)] border-[var(--color-border)]",
  error: "bg-[var(--color-danger-subtle)] border-red-200/50",
};

const ICON_SIZES: Record<NonNullable<EmptyStateProps["size"]>, { wrap: string; icon: LucideProps["size"] }> = {
  sm: { wrap: "w-9 h-9", icon: 16 },
  md: { wrap: "w-12 h-12", icon: 20 },
  lg: { wrap: "w-16 h-16", icon: 26 },
};

export function EmptyState({
  variant = "default",
  icon: IconOverride,
  title,
  description,
  action,
  className,
  size = "md",
}: EmptyStateProps) {
  const Icon = IconOverride ?? DEFAULT_ICONS[variant];
  const { wrap, icon: iconSize } = ICON_SIZES[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-16 px-6 text-center bg-white rounded-2xl border border-neutral-200/60 shadow-sm max-w-lg mx-auto",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-xl shrink-0 border shadow-[0_1px_3px_rgba(0,0,0,0.02)]",
          wrap,
          ICON_BG[variant]
        )}
      >
        <Icon size={iconSize} className={ICON_COLORS[variant]} />
      </div>

      <div className="space-y-1.5 max-w-sm">
        <p className="text-sm font-bold text-[var(--color-text-primary)]">
          {title}
        </p>
        {description && (
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
