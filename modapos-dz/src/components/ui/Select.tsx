import { type SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, placeholder, className, id, children, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full h-9 pl-3 pr-8 appearance-none",
              "bg-[var(--color-bg-elevated)] border border-[var(--color-border)]",
              "rounded-[var(--radius-md)] text-sm text-[var(--color-text-primary)]",
              "transition-colors duration-150 cursor-pointer",
              "focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/30",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              error && "border-[var(--color-danger)]",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>
          <ChevronDown className="absolute right-2.5 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
        </div>
        {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
