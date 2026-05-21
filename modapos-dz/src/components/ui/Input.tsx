import { type InputHTMLAttributes, forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-[var(--color-text-muted)] flex items-center">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-9 bg-[var(--color-bg-elevated)] border border-[var(--color-border)]",
              "rounded-[var(--radius-md)] text-sm text-[var(--color-text-primary)]",
              "placeholder:text-[var(--color-text-muted)]",
              "transition-colors duration-150",
              "focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/30",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              error && "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/20",
              leftIcon ? "pl-9" : "pl-3",
              rightIcon ? "pr-9" : "pr-3",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-[var(--color-text-muted)] flex items-center">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p className="text-xs text-[var(--color-danger)]">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
