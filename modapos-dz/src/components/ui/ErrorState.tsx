import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = "Une erreur est survenue",
  description = "Impossible de charger les données. Veuillez réessayer.",
  onRetry,
  retryLabel = "Réessayer",
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-14 px-6 text-center",
        className
      )}
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-danger-subtle)] shrink-0">
        <AlertTriangle className="w-7 h-7 text-[var(--color-danger)]" />
      </div>

      <div className="space-y-1 max-w-xs">
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
          {title}
        </p>
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
          {description}
        </p>
      </div>

      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          className="gap-1.5 mt-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
