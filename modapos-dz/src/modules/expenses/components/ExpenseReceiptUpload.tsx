import { useCallback, useMemo, useState } from "react";
import { FileText, ImageIcon, Upload, Download, Trash2 } from "lucide-react";
import { useIPC } from "@/hooks/useIPC";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ExpenseReceiptUploadProps {
  value?: string;
  onChange: (path: string | undefined) => void;
  onDeleteOriginal?: (path: string) => void;
  className?: string;
}

function isPdf(path?: string) {
  return path?.toLowerCase().endsWith(".pdf");
}

export function ExpenseReceiptUpload({ value, onChange, className }: ExpenseReceiptUploadProps) {
  const api = useIPC();
  const [isLoading, setIsLoading] = useState(false);

  const preview = useMemo(() => {
    if (!value) return null;
    return {
      isPdf: isPdf(value),
      src: `media://${value}`,
    };
  }, [value]);

  const handleSelect = useCallback(async () => {
    setIsLoading(true);
    try {
      const savedPath = await api<string | null>("expenses:selectReceipt");
      if (savedPath) onChange(savedPath);
    } catch {
      toast.error("Erreur lors du chargement du recu");
    } finally {
      setIsLoading(false);
    }
  }, [api, onChange]);

  const handleRemove = useCallback(async () => {
    if (!value) return;
    try {
      await api("expenses:deleteReceipt", value);
      onChange(undefined);
    } catch {
      toast.error("Erreur lors de la suppression du recu");
    }
  }, [api, onChange, value]);

  const handleDownload = useCallback(async () => {
    if (!value) return;
    try {
      await api("expenses:downloadReceipt", value);
    } catch {
      toast.error("Erreur lors du telechargement");
    }
  }, [api, value]);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="text-xs font-semibold text-[var(--color-text-secondary)] tracking-wide uppercase">
        Recu
      </span>

      {preview ? (
        <div className="relative rounded-[var(--radius-lg)] overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
          {preview.isPdf ? (
            <div className="h-48 flex flex-col items-center justify-center gap-2 text-[var(--color-text-secondary)]">
              <FileText className="w-10 h-10" />
              <span className="text-sm">Document PDF</span>
            </div>
          ) : (
            <img src={preview.src} alt="Recu" className="w-full h-48 object-cover" />
          )}

          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleSelect}
              className="px-3 py-1.5 rounded-[var(--radius-sm)] bg-white text-xs font-semibold"
            >
              Remplacer
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-[var(--radius-sm)] bg-white text-xs font-semibold inline-flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              Telecharger
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-danger-subtle)] text-[var(--color-danger)] text-xs font-semibold inline-flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Supprimer
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleSelect}
          disabled={isLoading}
          className={cn(
            "h-48 flex flex-col items-center justify-center gap-3",
            "rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--color-border)]",
            "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]",
            "hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)]",
            "transition-all duration-200"
          )}
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-[var(--color-bg-overlay)] flex items-center justify-center">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Ajouter un recu</p>
                <p className="text-xs mt-0.5 text-[var(--color-text-muted)]">JPG, PNG, PDF</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Upload className="w-3 h-3" />
                <span>Parcourir les fichiers</span>
              </div>
            </>
          )}
        </button>
      )}
    </div>
  );
}
