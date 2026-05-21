import { useCallback, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { useIPC } from "@/hooks/useIPC";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string; // imagePath stored in DB (e.g. "images/xxx.jpg")
  onChange: (path: string | undefined) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const api = useIPC();
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = useCallback(async () => {
    setIsLoading(true);
    try {
      const savedPath = await api<string | null>("products:selectImage");
      if (savedPath) onChange(savedPath);
    } catch {
      toast.error("Erreur lors du chargement de l'image");
    } finally {
      setIsLoading(false);
    }
  }, [api, onChange]);

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(undefined);
    },
    [onChange]
  );

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
        Image produit
      </span>

      {value ? (
        // Image preview
        <div className="relative group rounded-[var(--radius-lg)] overflow-hidden border border-[var(--color-border)] aspect-square bg-[var(--color-bg-elevated)]">
          <img
            src={`media://${value}`}
            alt="Aperçu produit"
            className="w-full h-full object-cover"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleSelect}
              className="px-3 py-1.5 bg-[var(--color-accent)] text-white text-xs font-medium rounded-[var(--radius-sm)] hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              Changer
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1.5 bg-[var(--color-danger-subtle)] text-[var(--color-danger)] text-xs font-medium rounded-[var(--radius-sm)] hover:bg-[var(--color-danger)]/30 transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Supprimer
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
            "rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--color-border)]",
            "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]",
            "hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)]",
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
                <p className="text-sm font-medium">Choisir une image</p>
                <p className="text-xs mt-0.5 text-[var(--color-text-muted)]">
                  JPG, PNG, WEBP
                </p>
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
