import { type ReactNode, useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useTranslation } from "@/hooks/useTranslation";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  /** Allow the modal body to scroll independently (for tall content) */
  scrollable?: boolean;
}

const sizeClasses = {
  sm: "max-w-[480px]",
  md: "max-w-[560px]",
  lg: "max-w-[680px]",
  xl: "max-w-[800px]",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  scrollable = false,
}: ModalProps) {
  const titleId = useId();
  const descId = useId();
  const { t, isRtl } = useTranslation();

  useKeyboard({ Escape: () => isOpen && onClose() });

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--color-bg-subtle)]/60 backdrop-blur-[6px] animate-fade-fast"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          "relative w-full animate-scale-in flex flex-col",
          "bg-[var(--color-bg-surface)] border border-[var(--color-border)]",
          "rounded-[var(--radius-2xl)] shadow-[var(--shadow-xl)]",
          "max-h-[calc(100dvh-2rem)]",
          sizeClasses[size]
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
              padding: "28px 32px 20px",
              borderBottom: "1px solid rgba(208,197,175,0.3)",
              flexShrink: 0,
            }}
          >
            <div style={{ minWidth: 0 }}>
              {title && (
                <h2
                  id={titleId}
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "var(--color-on-surface)",
                    fontFamily: "var(--font-display)",
                    lineHeight: 1.3,
                  }}
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id={descId}
                  style={{
                    marginTop: 6,
                    fontSize: "var(--text-body-sm)",
                    color: "var(--color-secondary)",
                    lineHeight: "var(--lh-body-sm)",
                  }}
                >
                  {description}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label={t("common.buttons.close")}
              className={cn("shrink-0 -mt-1 no-drag", isRtl ? "-ml-1" : "-mr-1")}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Body */}
        <div
          style={{
            padding: "28px 32px",
          }}
          className={cn(
            scrollable
              ? "overflow-y-auto flex-1 min-h-0"
              : "overflow-visible"
          )}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 12,
              padding: "20px 32px",
              borderTop: "1px solid rgba(208,197,175,0.3)",
              flexShrink: 0,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
