import { useState } from "react";
import {
  useFieldArray,
  type Control,
  type UseFormRegister,
  type FieldErrors,
  useFormContext,
} from "react-hook-form";
import { Plus, Trash2, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductFormData } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

// Common size presets for clothing stores
const SIZE_PRESETS = ["XS", "S", "M", "L", "XL", "XXL", "36", "38", "40", "42", "44", "46"];

// Common color presets
const COLOR_PRESETS = [
  { label: "Noir",   color: "#1a1a1a" },
  { label: "Blanc",  color: "#f5f5f5" },
  { label: "Gris",   color: "#9ca3af" },
  { label: "Bleu",   color: "#3b82f6" },
  { label: "Rouge",  color: "#ef4444" },
  { label: "Vert",   color: "#22c55e" },
  { label: "Beige",  color: "#d4b896" },
  { label: "Marron", color: "#92400e" },
  { label: "Rose",   color: "#ec4899" },
  { label: "Jaune",  color: "#eab308" },
  { label: "Orange", color: "#f97316" },
  { label: "Violet", color: "#a855f7" },
];

interface VariantEditorProps {
  control: Control<ProductFormData>;
  register: UseFormRegister<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
}

const inputCls = cn(
  "w-full h-10 px-3 text-sm rounded-[var(--radius-md)]",
  "bg-[var(--color-surface-container-lowest)] border border-[rgba(208,197,175,0.4)]",
  "text-[var(--color-on-surface)] placeholder:text-[var(--color-text-muted)]",
  "focus:outline-none focus:border-[var(--color-tertiary)] focus:ring-2 focus:ring-[rgba(77,139,139,0.15)]",
  "transition-all duration-150"
);

function VariantRow({
  idx,
  register,
  errors,
  onRemove,
}: {
  idx: number;
  register: UseFormRegister<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  onRemove: () => void;
}) {
  const [colorOpen, setColorOpen] = useState(false);
  const { setValue, watch } = useFormContext<ProductFormData>();
  const colorValue = watch(`variants.${idx}.color`);
  const matchedPreset = COLOR_PRESETS.find(
    (c) => c.label.toLowerCase() === colorValue?.toLowerCase()
  );

  return (
    <div
      className="group grid items-center gap-3 px-4 py-3 rounded-[var(--radius-lg)] border border-[rgba(208,197,175,0.3)] bg-[var(--color-surface-container-lowest)] hover:border-[rgba(208,197,175,0.55)] transition-all"
      style={{ gridTemplateColumns: "1fr 1.6fr 90px 1.4fr 36px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      {/* Taille */}
      <input
        {...register(`variants.${idx}.size`, { required: true })}
        placeholder="ex: M, XL, 42"
        list="size-datalist"
        className={cn(inputCls, errors.variants?.[idx]?.size && "border-red-400")}
      />

      {/* Couleur + swatch */}
      <div className="relative flex items-center gap-2">
        <button
          type="button"
          onClick={() => setColorOpen((o) => !o)}
          className="flex-shrink-0 w-10 h-10 rounded-[var(--radius-md)] border-2 flex items-center justify-center transition-all hover:scale-105 focus:outline-none"
          style={{
            background: matchedPreset?.color ?? "var(--color-surface-container)",
            borderColor: matchedPreset ? "rgba(208,197,175,0.6)" : "rgba(208,197,175,0.4)",
          }}
          title="Choisir une couleur"
        >
          {!matchedPreset && <span className="text-xs">🎨</span>}
        </button>
        <input
          {...register(`variants.${idx}.color`, { required: true })}
          placeholder="ex: Noir, Bleu"
          list="color-datalist"
          className={cn(inputCls, "flex-1", errors.variants?.[idx]?.color && "border-red-400")}
        />

        {/* Color picker dropdown */}
        {colorOpen && (
          <div
            className="absolute top-full left-0 z-50 mt-1.5 p-3 rounded-[var(--radius-lg)] border border-[rgba(208,197,175,0.4)] bg-[var(--color-surface-container-lowest)] shadow-xl"
            style={{ minWidth: 240 }}
          >
            <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
              Couleurs rapides
            </p>
            <div className="grid grid-cols-6 gap-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  title={c.label}
                  onClick={() => { setValue(`variants.${idx}.color`, c.label); setColorOpen(false); }}
                  className="flex flex-col items-center gap-1"
                >
                  <span
                    className="w-7 h-7 rounded-full border-2 block transition-all hover:scale-110"
                    style={{
                      background: c.color,
                      borderColor: colorValue?.toLowerCase() === c.label.toLowerCase() ? "var(--color-tertiary)" : "rgba(208,197,175,0.3)",
                      boxShadow: colorValue?.toLowerCase() === c.label.toLowerCase() ? "0 0 0 2px var(--color-tertiary)" : "none",
                    }}
                  />
                  <span className="text-[9px] text-[var(--color-text-muted)] leading-none">{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quantité */}
      <input
        {...register(`variants.${idx}.stock`, { required: true, valueAsNumber: true, min: 0 })}
        type="number"
        min={0}
        placeholder="0"
        className={cn(inputCls, "text-center", errors.variants?.[idx]?.stock && "border-red-400")}
      />

      {/* Code-barres */}
      <input
        {...register(`variants.${idx}.barcode`)}
        placeholder="Code-barres"
        className={cn(inputCls, "font-mono text-[13px]")}
      />

      {/* Delete */}
      <button
        type="button"
        onClick={onRemove}
        className="h-10 w-9 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 transition-all opacity-40 group-hover:opacity-100"
        title="Supprimer"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export function VariantEditor({ control, register, errors }: VariantEditorProps) {
  const { t } = useTranslation();
  const { fields, append, remove } = useFieldArray({ control, name: "variants" });

  const addVariant = () => append({ size: "", color: "", stock: 0, barcode: "" });

  return (
    <div className="flex flex-col gap-5">

      {/* ── Section header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(77,139,139,0.12)" }}
          >
            <Layers className="w-4 h-4 text-[var(--color-tertiary)]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-on-surface)]">
              {t("products.form.variants")}
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              {fields.length === 0
                ? "Gérez la taille, la couleur et le stock de chaque variante"
                : `${fields.length} variante${fields.length > 1 ? "s" : ""} configurée${fields.length > 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={addVariant}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* ── Quick-pick size shortcuts ── */}
      <div
        className="flex flex-wrap items-center gap-2 px-4 py-3 rounded-[var(--radius-lg)] border border-[rgba(208,197,175,0.25)]"
        style={{ background: "rgba(208,197,175,0.06)" }}
      >
        <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider shrink-0 mr-1">
          Tailles rapides :
        </span>
        {SIZE_PRESETS.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => append({ size, color: "", stock: 0, barcode: "" })}
            className="px-3 py-1 text-xs font-medium rounded-[var(--radius-sm)] border border-[rgba(208,197,175,0.4)] text-[var(--color-on-surface-variant)] hover:border-[var(--color-tertiary)] hover:text-[var(--color-tertiary)] hover:bg-[rgba(77,139,139,0.08)] transition-all duration-150"
          >
            {size}
          </button>
        ))}
      </div>

      {/* ── Variant rows or empty state ── */}
      {fields.length > 0 ? (
        <div className="flex flex-col gap-2">
          {/* Column labels */}
          <div
            className="grid px-4 pb-1"
            style={{ gridTemplateColumns: "1fr 1.6fr 90px 1.4fr 36px", gap: "12px" }}
          >
            {["Taille", "Couleur", "Qté", "Code-barres", ""].map((label, i) => (
              <span key={i} className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                {label}
              </span>
            ))}
          </div>

          {/* Rows */}
          {fields.map((field, idx) => (
            <VariantRow
              key={field.id}
              idx={idx}
              register={register}
              errors={errors}
              onRemove={() => remove(idx)}
            />
          ))}

          {/* Bottom add row */}
          <button
            type="button"
            onClick={addVariant}
            className="mt-1 flex items-center justify-center gap-2 py-3 rounded-[var(--radius-lg)] border-2 border-dashed border-[rgba(208,197,175,0.4)] text-sm text-[var(--color-text-muted)] hover:border-[var(--color-tertiary)] hover:text-[var(--color-tertiary)] hover:bg-[rgba(77,139,139,0.03)] transition-all duration-150"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center py-12 rounded-[var(--radius-lg)] border-2 border-dashed border-[rgba(208,197,175,0.35)]"
          style={{ background: "rgba(208,197,175,0.03)" }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
            style={{ background: "rgba(77,139,139,0.1)" }}
          >
            <Layers className="w-5 h-5 text-[var(--color-tertiary)]" />
          </div>
          <p className="text-sm font-medium text-[var(--color-on-surface-variant)] mb-1.5">
            Aucune variante ajoutée
          </p>
          <p className="text-xs text-[var(--color-text-muted)] text-center max-w-[280px] leading-relaxed">
            Utilisez les raccourcis de taille ci-dessus ou cliquez sur{" "}
            <button
              type="button"
              onClick={addVariant}
              className="font-semibold text-[var(--color-tertiary)] hover:underline"
            >
              Ajouter
            </button>
            .
          </p>
        </div>
      )}

      {/* Datalists */}
      <datalist id="size-datalist">
        {SIZE_PRESETS.map((s) => <option key={s} value={s} />)}
      </datalist>
      <datalist id="color-datalist">
        {COLOR_PRESETS.map((c) => <option key={c.label} value={c.label} />)}
      </datalist>
    </div>
  );
}
