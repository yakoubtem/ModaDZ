import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "outline";
  size?: "sm" | "md" | "lg" | "icon" | "icon-sm";
  isLoading?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] active:scale-[0.98] active:shadow-[var(--shadow-xs)]",
  secondary:
    "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)] hover:border-[var(--color-border-strong)] shadow-[var(--shadow-xs)] active:scale-[0.98]",
  ghost:
    "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] active:scale-[0.98]",
  outline:
    "bg-transparent text-[var(--color-accent)] border border-[var(--color-accent-border)] hover:bg-[var(--color-accent-subtle)] active:scale-[0.98]",
  danger:
    "bg-[var(--color-danger-subtle)] text-[var(--color-danger)] border border-[var(--color-danger)]/20 hover:bg-[var(--color-danger)]/10 hover:border-[var(--color-danger)]/30 active:scale-[0.98]",
  success:
    "bg-[var(--color-success-subtle)] text-[var(--color-success)] border border-[var(--color-success)]/20 hover:bg-[var(--color-success)]/10 hover:border-[var(--color-success)]/30 active:scale-[0.98]",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  "icon-sm": "h-7 w-7 rounded-[var(--radius-md)]",
  sm:        "h-7 px-2.5 text-xs gap-1.5 rounded-[var(--radius-md)] font-medium",
  md:        "h-8 px-3.5 text-sm gap-2 rounded-[var(--radius-md)] font-medium",
  lg:        "h-10 px-5 text-sm gap-2.5 rounded-[var(--radius-lg)] font-semibold",
  icon:      "h-8 w-8 rounded-[var(--radius-md)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "secondary",
      size = "md",
      isLoading = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer select-none",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
