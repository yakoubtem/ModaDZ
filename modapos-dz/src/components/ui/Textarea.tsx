import { type TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const fieldId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        {label && (
          <label
            htmlFor={fieldId}
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
        <textarea
          ref={ref}
          id={fieldId}
          rows={3}
          style={{
            width: "100%",
            background: "var(--color-sand)",
            border: error
              ? "1.5px solid var(--color-danger)"
              : "1.5px solid rgba(208,197,175,0.3)",
            borderRadius: "var(--radius-lg)",
            padding: "14px 16px",
            fontSize: "var(--text-body-sm)",
            fontFamily: "var(--font-body)",
            color: "var(--color-on-surface)",
            outline: "none",
            resize: "none",
            lineHeight: 1.6,
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
        {error && <p className="text-xs text-[var(--color-danger)] mt-1.5">{error}</p>}
        {hint && !error && (
          <p className="text-xs text-[var(--color-text-muted)] mt-1.5">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
