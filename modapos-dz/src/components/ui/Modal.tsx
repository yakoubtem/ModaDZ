import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { useKeyboard } from "@/hooks/useKeyboard";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: ModalProps) {
  useKeyboard({ Escape: () => isOpen && onClose() });

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "relative w-full mx-4 animate-scale-in",
          "bg-[var(--color-bg-surface)] border border-[var(--color-border)]",
          "rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)]",
          sizeClasses[size]
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4 border-b border-[var(--color-border)]">
            <div>
              {title && (
                <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
                  {description}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Fermer"
              className="shrink-0 -mr-1 -mt-1 no-drag"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[var(--color-border)]">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
