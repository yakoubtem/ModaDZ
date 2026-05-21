import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] shadow-[var(--shadow-sm)] active:scale-[0.98]",
  secondary:
    "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-overlay)] active:scale-[0.98]",
  ghost:
    "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]",
  danger:
    "bg-[var(--color-danger-subtle)] text-[var(--color-danger)] border border-[var(--color-danger)]/30 hover:bg-[var(--color-danger)]/20 active:scale-[0.98]",
  success:
    "bg-[var(--color-success-subtle)] text-[var(--color-success)] border border-[var(--color-success)]/30 hover:bg-[var(--color-success)]/20 active:scale-[0.98]",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-7 px-2.5 text-xs gap-1.5 rounded-[var(--radius-sm)]",
  md: "h-9 px-3.5 text-sm gap-2 rounded-[var(--radius-md)]",
  lg: "h-11 px-5 text-base gap-2.5 rounded-[var(--radius-md)]",
  icon: "h-9 w-9 rounded-[var(--radius-md)]",
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
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
