import { useCallback, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { useIPC } from "@/hooks/useIPC";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

interface ImageUploadProps {
  value?: string; // imagePath stored in DB (e.g. "images/xxx.jpg")
  onChange: (path: string | undefined) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const { t } = useTranslation();
  const api = useIPC();
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = useCallback(async () => {
    setIsLoading(true);
    try {
      const savedPath = await api<string | null>("products:selectImage");
      if (savedPath) onChange(savedPath);
    } catch {
      toast.error(t("products.form.image_upload_error"));
    } finally {
      setIsLoading(false);
    }
  }, [api, onChange, t]);

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(undefined);
    },
    [onChange]
  );

  return (
    <div className={cn("flex flex-col", className)}>
      <span className="block text-[length:var(--text-label-md)] font-bold text-[var(--color-on-surface-variant)] tracking-[0.02em] mb-[10px]">
        {t("products.form.image_title")}
      </span>

      {value ? (
        // Image preview
        <div className="relative group rounded-[var(--radius-lg)] overflow-hidden border-[1.5px] border-[rgba(208,197,175,0.3)] aspect-square bg-[var(--color-sand)]">
          <img
            src={`media://${value}`}
            alt={t("products.form.image_preview_alt")}
            className="w-full h-full object-cover"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleSelect}
              className="px-3 py-1.5 bg-[var(--color-tertiary)] text-white text-xs font-semibold rounded-[var(--radius-md)] hover:bg-[var(--color-tertiary)]/90 transition-colors"
            >
              {t("products.form.change_image")}
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-[var(--radius-md)] hover:bg-red-700 transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              {t("products.form.delete_image")}
            </button>
          </div>
        </div>
      ) : (
        // Upload dropzone
        <button
          type="button"
          onClick={handleSelect}
          disabled={isLoading}
          className={cn(
            "aspect-square flex flex-col items-center justify-center gap-3",
            "rounded-[var(--radius-lg)] border-[1.5px] border-dashed border-[rgba(208,197,175,0.4)]",
            "bg-[var(--color-sand)] text-[var(--color-secondary)]",
            "hover:border-[var(--color-tertiary)] hover:text-[var(--color-tertiary)] hover:bg-[rgba(39,104,104,0.04)]",
            "transition-all duration-200 cursor-pointer group"
          )}
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-[var(--color-bg-overlay)] flex items-center justify-center group-hover:bg-[var(--color-accent-subtle)] transition-colors">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">{t("products.form.choose_image")}</p>
                <p className="text-xs mt-0.5 text-[var(--color-text-muted)]">
                  JPG, PNG, WEBP
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Upload className="w-3 h-3" />
                <span>{t("products.form.browse_files")}</span>
              </div>
            </>
          )}
        </button>
      )}
    </div>
  );
}
