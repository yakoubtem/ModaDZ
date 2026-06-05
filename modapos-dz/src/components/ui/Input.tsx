import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold tracking-wide text-[var(--color-text-secondary)]"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full min-h-[44px]",
              "rounded-[var(--radius-lg)]",
              "border border-[var(--color-border)]",
              "bg-[var(--color-bg-surface)]",
              "px-4 py-3",
              "text-sm text-[var(--color-text-primary)]",
              "shadow-[var(--shadow-xs)]",
              "placeholder:text-[var(--color-text-muted)]",
              "transition-all duration-200",

              "focus-visible:outline-none",
              "focus-visible:border-[var(--color-accent)]",
              "focus-visible:ring-2",
              "focus-visible:ring-[var(--color-accent)]/20",

              "hover:border-[var(--color-border-strong)]",

              "disabled:cursor-not-allowed",
              "disabled:opacity-50",
              "disabled:bg-[var(--color-bg-elevated)]",

              leftIcon ? "pl-12" : "",
              rightIcon ? "pr-12" : "",

              error &&
              "border-[var(--color-danger)] focus-visible:border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]/20",

              className
            )}
            {...props}
          />

          {rightIcon && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none">
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <p className="flex items-center gap-1 text-xs text-[var(--color-danger)]">
            <span>⚠</span>
            {error}
          </p>
        )}

        {hint && !error && (
          <p className="text-xs text-[var(--color-text-muted)]">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";