import { useCallback, useMemo, useState } from "react";
import { FileText, ImageIcon, Upload, Download, Trash2 } from "lucide-react";
import { useIPC } from "@/hooks/useIPC";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

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
  const { t } = useTranslation();
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
      toast.error(t("expenses.toasts.receipt_upload_error"));
    } finally {
      setIsLoading(false);
    }
  }, [api, onChange, t]);

  const handleRemove = useCallback(async () => {
    if (!value) return;
    try {
      await api("expenses:deleteReceipt", value);
      onChange(undefined);
    } catch {
      toast.error(t("expenses.toasts.receipt_delete_error"));
    }
  }, [api, onChange, value, t]);

  const handleDownload = useCallback(async () => {
    if (!value) return;
    try {
      await api("expenses:downloadReceipt", value);
    } catch {
      toast.error(t("expenses.toasts.receipt_download_error"));
    }
  }, [api, value, t]);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="text-xs font-semibold text-[var(--color-text-secondary)] tracking-wide uppercase">
        {t("expenses.form.receipt")}
      </span>

      {preview ? (
        <div className="relative rounded-[var(--radius-lg)] overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
          {preview.isPdf ? (
            <div className="h-48 flex flex-col items-center justify-center gap-2 text-[var(--color-text-secondary)]">
              <FileText className="w-10 h-10" />
              <span className="text-sm">{t("expenses.form.receipt_pdf")}</span>
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
              {t("expenses.form.receipt_replace")}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-[var(--radius-sm)] bg-white text-xs font-semibold inline-flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              {t("expenses.form.receipt_download")}
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-danger-subtle)] text-[var(--color-danger)] text-xs font-semibold inline-flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              {t("expenses.form.receipt_delete")}
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
                <p className="text-sm font-medium">{t("expenses.form.receipt_add")}</p>
                <p className="text-xs mt-0.5 text-[var(--color-text-muted)]">{t("expenses.form.receipt_formats")}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Upload className="w-3 h-3" />
                <span>{t("expenses.form.receipt_browse")}</span>
              </div>
            </>
          )}
        </button>
      )}
    </div>
  );
}
