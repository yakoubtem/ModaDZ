import { type SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, placeholder, className, id, children, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const { isRtl } = useTranslation();

    const paddingLeft = isRtl ? "40px" : "16px";
    const paddingRight = isRtl ? "16px" : "40px";

    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        {label && (
          <label
            htmlFor={selectId}
            style={{
              display: "block",
              fontSize: "var(--text-label-md)",
              fontWeight: 700,
              color: "var(--color-on-surface-variant)",
              marginBottom: 10,
              letterSpacing: "0.02em",
              textAlign: isRtl ? "right" : "left",
            }}
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            style={{
              width: "100%",
              minHeight: "44px",
              background: "var(--color-sand)",
              border: error
                ? "1.5px solid var(--color-danger)"
                : "1.5px solid rgba(208,197,175,0.3)",
              borderRadius: "var(--radius-lg)",
              paddingTop: "14px",
              paddingBottom: "14px",
              paddingLeft,
              paddingRight,
              fontSize: "var(--text-body-sm)",
              fontFamily: "var(--font-body)",
              color: "var(--color-on-surface)",
              outline: "none",
              cursor: "pointer",
              appearance: "none",
              WebkitAppearance: "none",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            className={className}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--color-tertiary)";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(39,104,104,0.12)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = error ? "var(--color-danger)" : "rgba(208,197,175,0.3)";
              e.currentTarget.style.boxShadow = "none";
            }}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>
          <ChevronDown className={`absolute w-4 h-4 text-[var(--color-text-muted)] pointer-events-none ${isRtl ? "left-3.5" : "right-3.5"}`} />
        </div>
        {error && <p className="text-xs text-[var(--color-danger)] mt-1.5">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
