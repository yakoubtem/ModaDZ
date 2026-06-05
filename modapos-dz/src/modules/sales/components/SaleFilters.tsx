import type { SalesFilters } from "@/types";

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
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 14px",
              borderRadius: "var(--radius-full)",
              border: isActive
                ? "1.5px solid var(--color-primary-container)"
                : "1.5px solid rgba(208,197,175,0.4)",
              background: isActive
                ? "var(--color-accent-subtle)"
                : "transparent",
              color: isActive
                ? "var(--color-primary)"
                : "var(--color-secondary)",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-label-sm)",
              fontWeight: isActive ? 700 : 500,
              letterSpacing: "0.03em",
              cursor: "pointer",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
            }}
          >
            {isActive && (
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>check</span>
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

const hasActiveFilters = (f: SalesFilters) =>
  f.search || f.paymentMethod || f.status || f.from || f.to;

export function SaleFilters({ filters, onChange, onReset }: SaleFiltersProps) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(208,197,175,0.3)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-card)",
        marginBottom: 16,
        overflow: "hidden",
      }}
    >
      {/* Top row: search + date pickers */}
      <div
        style={{
          display: "flex",
          gap: 0,
          alignItems: "stretch",
          borderBottom: "1px solid rgba(208,197,175,0.2)",
          flexWrap: "wrap",
        }}
      >
        {/* Search */}
        <div
          style={{
            flex: 2,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 20px",
            minWidth: "300px",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 20, color: "var(--color-outline)", flexShrink: 0 }}
          >
            search
          </span>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Rechercher par N° reçu ou nom client…"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: "var(--text-body-md)",
              fontFamily: "var(--font-body)",
              color: "var(--color-on-surface)",
            }}
          />
          {filters.search && (
            <button
              onClick={() => onChange({ search: "" })}
              style={{
                background: "var(--color-surface-container-high)",
                border: "none",
                cursor: "pointer",
                color: "var(--color-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 4,
                borderRadius: "var(--radius-full)",
                flexShrink: 0,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
            </button>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: "rgba(208,197,175,0.2)", flexShrink: 0 }} />

        {/* Date Pickers */}
        <div
          style={{
            flex: 3,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 20px",
            minWidth: "320px",
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0 }}>
            Période
          </span>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => onChange({ from: e.target.value })}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: "var(--text-body-sm)",
              fontFamily: "var(--font-body)",
              color: "var(--color-on-surface)",
              cursor: "pointer",
            }}
          />
          <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-text-muted)" }}>→</span>
          <input
            type="date"
            value={filters.to}
            onChange={(e) => onChange({ to: e.target.value })}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: "var(--text-body-sm)",
              fontFamily: "var(--font-body)",
              color: "var(--color-on-surface)",
              cursor: "pointer",
            }}
          />
          {hasActiveFilters(filters) && (
            <button
              onClick={onReset}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-error)",
                fontSize: "var(--text-label-sm)",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>filter_list_off</span>
              Effacer
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Status chips & Payment method chips */}
      <div
        style={{
          display: "flex",
          gap: "32px",
          padding: "12px 20px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
            Paiement
          </span>
          <TabFilter
            options={PAYMENT_OPTIONS}
            value={filters.paymentMethod}
            onChange={(v) => onChange({ paymentMethod: v })}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
            Statut
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
