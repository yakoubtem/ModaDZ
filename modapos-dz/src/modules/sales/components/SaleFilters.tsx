import { X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { SalesFilters } from "@/types";
import { cn } from "@/lib/utils";

interface SaleFiltersProps {
  filters: SalesFilters;
  onChange: (f: Partial<SalesFilters>) => void;
  onReset: () => void;
  total: number;
}

const PAYMENT_OPTIONS = [
  { value: "", label: "Tous paiements" },
  { value: "cash", label: "Espèces" },
  { value: "card", label: "Carte" },
  { value: "transfer", label: "Virement" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Tous statuts" },
  { value: "completed", label: "Complétée" },
  { value: "refunded", label: "Remboursée" },
  { value: "pending", label: "En attente" },
];

function TabFilter({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] transition-all duration-150",
            value === opt.value
              ? "bg-[var(--color-accent)] text-white shadow-sm"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

const hasActiveFilters = (f: SalesFilters) =>
  f.search || f.paymentMethod || f.status || f.from || f.to;

export function SaleFilters({ filters, onChange, onReset, total }: SaleFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Row 1: Search + Date range */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Rechercher par N° reçu ou nom client…"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          className="flex-1"
        />

        <div className="flex items-center gap-2 shrink-0">
          <input
            type="date"
            value={filters.from}
            onChange={(e) => onChange({ from: e.target.value })}
            className={cn(
              "h-9 px-3 text-sm rounded-[var(--radius-md)]",
              "bg-[var(--color-bg-elevated)] border border-[var(--color-border)]",
              "text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
            )}
          />
          <span className="text-xs text-[var(--color-text-muted)]">→</span>
          <input
            type="date"
            value={filters.to}
            onChange={(e) => onChange({ to: e.target.value })}
            className={cn(
              "h-9 px-3 text-sm rounded-[var(--radius-md)]",
              "bg-[var(--color-bg-elevated)] border border-[var(--color-border)]",
              "text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
            )}
          />
        </div>

        {hasActiveFilters(filters) && (
          <Button variant="ghost" size="sm" onClick={onReset} className="gap-1.5 shrink-0">
            <X className="w-3.5 h-3.5" />
            Effacer
          </Button>
        )}
      </div>

      {/* Row 2: Payment + Status tabs + result count */}
      <div className="flex items-center gap-3 flex-wrap">
        <TabFilter
          options={PAYMENT_OPTIONS}
          value={filters.paymentMethod}
          onChange={(v) => onChange({ paymentMethod: v })}
        />
        <TabFilter
          options={STATUS_OPTIONS}
          value={filters.status}
          onChange={(v) => onChange({ status: v })}
        />
        <span className="text-xs text-[var(--color-text-muted)] ml-auto">
          {total} vente{total !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
