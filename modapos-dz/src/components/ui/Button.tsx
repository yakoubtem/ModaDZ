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
    "bg-[var(--color-secondary)] text-white hover:bg-neutral-800 shadow-[var(--shadow-xs)] active:scale-[0.98]",
  ghost:
    "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-overlay)] hover:text-[var(--color-text-primary)] active:scale-[0.98]",
  outline:
    "bg-[var(--color-background)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)] active:scale-[0.98]",
  danger:
    "bg-[var(--color-danger-subtle)] text-[var(--color-danger)] border border-[var(--color-danger)]/20 hover:bg-[var(--color-danger)]/10 hover:border-[var(--color-danger)]/30 active:scale-[0.98]",
  success:
    "bg-[var(--color-success-subtle)] text-[var(--color-success)] border border-[var(--color-success)]/20 hover:bg-[var(--color-success)]/10 hover:border-[var(--color-success)]/30 active:scale-[0.98]",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  "icon-sm": "h-8 w-8 rounded-[var(--radius-md)]",
  sm: "h-8 px-3 text-xs rounded-[var(--radius-md)]",
  md: "h-9 px-4 text-[13px] rounded-[var(--radius-md)]",
  lg: "h-10 px-5 text-[14px] rounded-[var(--radius-lg)]",
  icon: "h-9 w-9 rounded-full",
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
