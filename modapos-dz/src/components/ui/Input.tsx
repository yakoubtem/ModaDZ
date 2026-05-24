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
            className="text-xs font-semibold text-[var(--color-text-secondary)] tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-[var(--color-text-muted)] flex items-center pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "flex w-full rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-surface)]",
              "px-4 py-2.5 text-[15px] text-[var(--color-text-primary)] shadow-[var(--shadow-xs)]",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-[var(--color-text-muted)]",
              "focus-visible:outline-none focus-visible:border-[var(--color-accent)] focus-visible:ring-4 focus-visible:ring-[var(--color-accent)]/15 focus-visible:shadow-[var(--shadow-sm)]",
              "hover:border-[var(--color-border-strong)] transition-all duration-300",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--color-bg-elevated)]",
              error && "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/10",
              leftIcon ? "pl-10" : "pl-4",
              rightIcon ? "pr-10" : "pr-4",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-[var(--color-text-muted)] flex items-center pointer-events-none">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p className="text-xs text-[var(--color-danger)] flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
