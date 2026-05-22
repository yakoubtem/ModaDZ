import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  isLoading?: boolean;
}

const VARIANT_CONFIG = {
  danger: {
    icon: Trash2,
    iconBg: "bg-[var(--color-danger-subtle)]",
    iconColor: "text-[var(--color-danger)]",
    confirmVariant: "danger" as const,
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-[var(--color-warning-subtle)]",
    iconColor: "text-[var(--color-warning)]",
    confirmVariant: "secondary" as const,
  },
};

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={config.confirmVariant}
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4 items-start">
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full shrink-0 mt-0.5",
            config.iconBg
          )}
        >
          <Icon className={cn("w-5 h-5", config.iconColor)} />
        </div>
        <div className="space-y-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            {title}
          </p>
          {description && (
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
