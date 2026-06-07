import { useFieldArray, type Control, type UseFormRegister, type FieldErrors } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { ProductFormData } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

// Common size presets for clothing stores
const SIZE_PRESETS = ["XS", "S", "M", "L", "XL", "XXL", "36", "38", "40", "42", "44", "46"];
// Common color presets
const COLOR_PRESETS = [
  { label: "Noir", color: "#1a1a1a" },
  { label: "Blanc", color: "#f5f5f5" },
  { label: "Gris", color: "#9ca3af" },
  { label: "Bleu", color: "#3b82f6" },
  { label: "Rouge", color: "#ef4444" },
  { label: "Vert", color: "#22c55e" },
  { label: "Beige", color: "#d4b896" },
  { label: "Marron", color: "#92400e" },
  { label: "Rose", color: "#ec4899" },
  { label: "Jaune", color: "#eab308" },
];

interface VariantEditorProps {
  control: Control<ProductFormData>;
  register: UseFormRegister<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
}

export function VariantEditor({ control, register, errors }: VariantEditorProps) {
  const { t, isRtl, language } = useTranslation();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const addVariant = () => {
    append({ size: "", color: "", stock: 0, barcode: "" });
  };

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            {t("products.form.variants")}
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {t("products.form.variants_desc")}
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addVariant}
          className="gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          {t("common.buttons.add")}
        </Button>
      </div>

      {/* Quick-pick sizes */}
      <div className="flex flex-wrap gap-1.5">
        <span className={cn("text-xs text-[var(--color-text-muted)] self-center", isRtl ? "ml-1" : "mr-1")}>
          {t("products.form.size_shortcuts")}
        </span>
        {SIZE_PRESETS.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => append({ size, color: "", stock: 0, barcode: "" })}
            className="px-2 py-0.5 text-xs rounded-[var(--radius-sm)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)] transition-colors"
          >
            {size}
          </button>
        ))}
      </div>

      {/* Variants table */}
      {fields.length > 0 ? (
        <div className="rounded-[var(--radius-lg)] border-[1.5px] border-[rgba(208,197,175,0.3)] overflow-hidden bg-transparent">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_1.2fr_80px_1.2fr_36px] gap-2 px-3 py-2.5 bg-[rgba(208,197,175,0.1)] border-b-[1.5px] border-[rgba(208,197,175,0.2)]">
            {[t("products.form.size"), t("products.form.color"), t("products.form.stock"), t("products.form.barcode"), ""].map((h, idx) => (
              <span key={idx} className="text-xs font-semibold text-[var(--color-secondary)] uppercase tracking-wider" style={{ textAlign: isRtl ? "right" : "left" }}>
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-[rgba(208,197,175,0.15)]">
            {fields.map((field, idx) => (
              <div
                key={field.id}
                className={cn(
                  "grid grid-cols-[1fr_1.2fr_80px_1.2fr_36px] gap-2 px-3 py-2 items-center",
                  "bg-transparent hover:bg-[rgba(208,197,175,0.04)] transition-colors"
                )}
              >
                {/* Size */}
                <input
                  {...register(`variants.${idx}.size`, { required: true })}
                  placeholder={t("products.form.size_placeholder")}
                  list="size-datalist"
                  className={cn(
                    "w-full h-8 px-2.5 rounded-[var(--radius-sm)] text-sm",
                    "bg-[var(--color-sand)] border border-[rgba(208,197,175,0.3)]",
                    "text-[var(--color-on-surface)] placeholder:text-[var(--color-text-muted)]",
                    "focus:outline-none focus:border-[var(--color-tertiary)] focus:ring-2 focus:ring-[rgba(39,104,104,0.12)]",
                    errors.variants?.[idx]?.size && "border-[var(--color-danger)]"
                  )}
                />

                {/* Color with presets */}
                <div className="relative flex items-center gap-1.5">
                  <input
                    {...register(`variants.${idx}.color`, { required: true })}
                    placeholder={t("products.form.color_placeholder")}
                    list="color-datalist"
                    className={cn(
                      "w-full h-8 px-2.5 rounded-[var(--radius-sm)] text-sm",
                      "bg-[var(--color-sand)] border border-[rgba(208,197,175,0.3)]",
                      "text-[var(--color-on-surface)] placeholder:text-[var(--color-text-muted)]",
                      "focus:outline-none focus:border-[var(--color-tertiary)] focus:ring-2 focus:ring-[rgba(39,104,104,0.12)]",
                      errors.variants?.[idx]?.color && "border-[var(--color-danger)]"
                    )}
                  />
                </div>

                {/* Stock */}
                <input
                  {...register(`variants.${idx}.stock`, {
                    required: true,
                    valueAsNumber: true,
                    min: 0,
                  })}
                  type="number"
                  min={0}
                  placeholder="0"
                  className={cn(
                    "w-full h-8 px-2.5 rounded-[var(--radius-sm)] text-sm text-center",
                    "bg-[var(--color-sand)] border border-[rgba(208,197,175,0.3)]",
                    "text-[var(--color-on-surface)] placeholder:text-[var(--color-text-muted)]",
                    "focus:outline-none focus:border-[var(--color-tertiary)] focus:ring-2 focus:ring-[rgba(39,104,104,0.12)]",
                    errors.variants?.[idx]?.stock && "border-[var(--color-danger)]"
                  )}
                />

                {/* Barcode */}
                <input
                  {...register(`variants.${idx}.barcode`)}
                  placeholder={t("products.form.barcode_placeholder")}
                  className={cn(
                    "w-full h-8 px-2.5 rounded-[var(--radius-sm)] text-sm font-mono",
                    "bg-[var(--color-sand)] border border-[rgba(208,197,175,0.3)]",
                    "text-[var(--color-on-surface)] placeholder:text-[var(--color-text-muted)]",
                    "focus:outline-none focus:border-[var(--color-tertiary)] focus:ring-2 focus:ring-[rgba(39,104,104,0.12)]"
                  )}
                />

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-text-muted)]">
            {t("products.form.no_variants")}{" "}
            {language === "ar" ? "اضغط على " : "Cliquez sur "}
            <button
              type="button"
              onClick={addVariant}
              className="text-[var(--color-accent)] hover:underline font-semibold"
            >
              {t("common.buttons.add")}
            </button>
            {language === "ar" ? " لإنشاء نوع منتج." : " pour créer une variante."}
          </p>
        </div>
      )}

      {/* Datalists for autocomplete */}
      <datalist id="size-datalist">
        {SIZE_PRESETS.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
      <datalist id="color-datalist">
        {COLOR_PRESETS.map((c) => (
          <option key={c.label} value={c.label} />
        ))}
      </datalist>
    </div>
  );
}
