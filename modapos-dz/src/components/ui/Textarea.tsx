import { type TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const fieldId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={fieldId}
            className="text-xs font-semibold text-[var(--color-text-secondary)] tracking-wide"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={fieldId}
          rows={3}
          className={cn(
            "w-full px-3 py-2 bg-[var(--color-bg-surface)] border border-[var(--color-border)]",
            "rounded-[var(--radius-md)] text-sm text-[var(--color-text-primary)]",
            "placeholder:text-[var(--color-text-muted)] resize-none",
            "transition-all duration-150 shadow-[var(--shadow-xs)]",
            "hover:border-[var(--color-border-strong)]",
            "focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--color-bg-elevated)]",
            error && "border-[var(--color-danger)] focus:border-[var(--color-danger)]",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
        {hint && !error && (
          <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
