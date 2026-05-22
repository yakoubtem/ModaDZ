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
  default: "text-[var(--color-text-muted)]",
  search: "text-[var(--color-text-muted)]",
  error: "text-[var(--color-danger)]",
};

const ICON_BG: Record<EmptyVariant, string> = {
  default: "bg-[var(--color-bg-overlay)]",
  search: "bg-[var(--color-bg-overlay)]",
  error: "bg-[var(--color-danger-subtle)]",
};

const ICON_SIZES: Record<NonNullable<EmptyStateProps["size"]>, { wrap: string; icon: LucideProps["size"] }> = {
  sm: { wrap: "w-10 h-10", icon: 16 },
  md: { wrap: "w-14 h-14", icon: 22 },
  lg: { wrap: "w-20 h-20", icon: 32 },
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
        "flex flex-col items-center justify-center gap-3 py-12 px-6 text-center",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full shrink-0",
          wrap,
          ICON_BG[variant]
        )}
      >
        <Icon size={iconSize} className={ICON_COLORS[variant]} />
      </div>

      <div className="space-y-1 max-w-xs">
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
          {title}
        </p>
        {description && (
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
