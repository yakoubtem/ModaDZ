import { X, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { SalesFilters } from "@/types";
import { cn } from "@/lib/utils";

interface SaleFiltersProps {
  filters: SalesFilters;
  onChange: (f: Partial<SalesFilters>) => void;
  onReset: () => void;
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
            "px-3.5 py-1.5 text-xs font-semibold rounded-[var(--radius-sm)] transition-all duration-150 cursor-pointer",
            value === opt.value
              ? "bg-[var(--color-accent)] text-white shadow-sm"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-overlay)]/40"
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

export function SaleFilters({ filters, onChange, onReset }: SaleFiltersProps) {
  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: "24px 32px", 
        borderRadius: "var(--radius-xl)", 
        display: "flex", 
        flexDirection: "column", 
        gap: "20px" 
      }}
    >
      {/* Row 1: Search + Date Pickers */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap", width: "100%" }}>
        <div style={{ flex: 1, minWidth: "280px" }}>
          <Input
            placeholder="Rechercher par N° reçu ou nom client…"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            leftIcon={<Search className="w-4 h-4 text-[var(--color-text-muted)]" />}
            className="w-full"
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Date de début
            </span>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => onChange({ from: e.target.value })}
              className={cn(
                "rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-surface)]",
                "px-3 py-1.5 text-[13px] text-[var(--color-text-primary)] shadow-[var(--shadow-xs)]",
                "focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15",
                "hover:border-[var(--color-border-strong)] transition-all duration-200 h-[38px] min-w-[140px]"
              )}
            />
          </div>
          <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-text-muted)", marginTop: "16px" }}>→</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Date de fin
            </span>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => onChange({ to: e.target.value })}
              className={cn(
                "rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-surface)]",
                "px-3 py-1.5 text-[13px] text-[var(--color-text-primary)] shadow-[var(--shadow-xs)]",
                "focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15",
                "hover:border-[var(--color-border-strong)] transition-all duration-200 h-[38px] min-w-[140px]"
              )}
            />
          </div>
        </div>

        {hasActiveFilters(filters) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onReset} 
            className="gap-1.5 shrink-0" 
            style={{ height: "38px", marginTop: "16px", padding: "0 16px" }}
          >
            <X className="w-4 h-4" />
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Subtle Divider */}
      <div style={{ height: "1px", background: "rgba(208,197,175,0.15)", width: "100%" }} />

      {/* Row 2: Status chips & Payment method chips */}
      <div style={{ display: "flex", alignItems: "center", gap: "32px", flexWrap: "wrap", width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Moyen de Paiement
          </span>
          <TabFilter
            options={PAYMENT_OPTIONS}
            value={filters.paymentMethod}
            onChange={(v) => onChange({ paymentMethod: v })}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Statut de la Vente
          </span>
          <TabFilter
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(v) => onChange({ status: v })}
          />
        </div>
      </div>
    </div>
  );
}
