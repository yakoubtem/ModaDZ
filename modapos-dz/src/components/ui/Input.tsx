import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

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
      <div style={{ display: "flex", flexDirection: "column" }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              display: "block",
              fontSize: "var(--text-label-md)",
              fontWeight: 700,
              color: "var(--color-on-surface-variant)",
              marginBottom: 10,
              letterSpacing: "0.02em",
            }}
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
              paddingLeft: leftIcon ? "48px" : "16px",
              paddingRight: rightIcon ? "48px" : "16px",
              fontSize: "var(--text-body-sm)",
              fontFamily: "var(--font-body)",
              color: "var(--color-on-surface)",
              outline: "none",
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
          />

          {rightIcon && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none">
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <p className="flex items-center gap-1 text-xs text-[var(--color-danger)] mt-1.5">
            <span>⚠</span>
            {error}
          </p>
        )}

        {hint && !error && (
          <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";