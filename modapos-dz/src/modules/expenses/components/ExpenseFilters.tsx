import { EXPENSE_CATEGORIES } from "@/types";
import type { ExpenseSort } from "@/types";

interface ExpenseFiltersProps {
  search: string;
  category: string;
  from: string;
  to: string;
  minAmount: string;
  maxAmount: string;
  sort: ExpenseSort;
  onSearch: (q: string) => void;
  onCategory: (c: string) => void;
  onDateRange: (from: string, to: string) => void;
  onAmountRange: (min: string, max: string) => void;
  onSort: (s: ExpenseSort) => void;
  onReset: () => void;
  total: number;
}

const SORT_OPTIONS: { value: ExpenseSort; label: string }[] = [
  { value: "newest", label: "Plus récent" },
  { value: "oldest", label: "Plus ancien" },
  { value: "highest", label: "Montant ↓" },
  { value: "lowest", label: "Montant ↑" },
];

export function ExpenseFilters({
  search,
  category,
  from,
  to,
  minAmount,
  maxAmount,
  sort,
  onSearch,
  onCategory,
  onDateRange,
  onAmountRange,
  onSort,
  onReset,
  total,
}: ExpenseFiltersProps) {
  const hasActiveFilters = category || from || to || minAmount || maxAmount || search;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(208,197,175,0.3)",
        borderRadius: "var(--radius-xl)",
        padding: "24px",
        marginBottom: 24,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Row 1: Search + Sort */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <span
            className="material-symbols-outlined"
            style={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 18,
              color: "var(--color-secondary)",
            }}
          >
            search
          </span>
          <input
            className="input-sand"
            placeholder="Rechercher une dépense…"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            style={{ paddingLeft: 48 }}
          />
        </div>

        <div style={{ display: "flex", gap: 4, background: "var(--color-surface-container-high)", borderRadius: "var(--radius-lg)", padding: "4px" }}>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSort(opt.value)}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-md)",
                border: "none",
                fontSize: "var(--text-label-sm)",
                fontWeight: "var(--fw-label-sm)",
                fontFamily: "var(--font-body)",
                cursor: "pointer",
                background: sort === opt.value ? "var(--color-surface-container-lowest)" : "transparent",
                color: sort === opt.value ? "var(--color-on-surface)" : "var(--color-secondary)",
                boxShadow: sort === opt.value ? "var(--shadow-soft)" : "none",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: Category + Dates + Amounts */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        {/* Category */}
        <select
          value={category}
          onChange={(e) => onCategory(e.target.value)}
          style={{
            background: "var(--color-sand)",
            border: "none",
            borderRadius: "var(--radius-lg)",
            padding: "10px 16px",
            fontSize: "var(--text-body-sm)",
            fontFamily: "var(--font-body)",
            color: category ? "var(--color-on-surface)" : "var(--color-secondary)",
            cursor: "pointer",
            outline: "none",
            minWidth: 160,
          }}
        >
          <option value="">Toutes catégories</option>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Date From */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: "var(--color-secondary)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Du</span>
          <input
            type="date"
            value={from}
            onChange={(e) => onDateRange(e.target.value, to)}
            style={{
              background: "var(--color-sand)",
              border: "none",
              borderRadius: "var(--radius-lg)",
              padding: "10px 14px",
              fontSize: "var(--text-body-sm)",
              fontFamily: "var(--font-body)",
              color: "var(--color-on-surface)",
              outline: "none",
            }}
          />
        </div>

        {/* Date To */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: "var(--color-secondary)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Au</span>
          <input
            type="date"
            value={to}
            onChange={(e) => onDateRange(from, e.target.value)}
            style={{
              background: "var(--color-sand)",
              border: "none",
              borderRadius: "var(--radius-lg)",
              padding: "10px 14px",
              fontSize: "var(--text-body-sm)",
              fontFamily: "var(--font-body)",
              color: "var(--color-on-surface)",
              outline: "none",
            }}
          />
        </div>

        {/* Min Amount */}
        <input
          type="number"
          placeholder="Min (DA)"
          value={minAmount}
          onChange={(e) => onAmountRange(e.target.value, maxAmount)}
          style={{
            background: "var(--color-sand)",
            border: "none",
            borderRadius: "var(--radius-lg)",
            padding: "10px 14px",
            fontSize: "var(--text-body-sm)",
            fontFamily: "var(--font-body)",
            color: "var(--color-on-surface)",
            outline: "none",
            width: 110,
          }}
        />

        {/* Max Amount */}
        <input
          type="number"
          placeholder="Max (DA)"
          value={maxAmount}
          onChange={(e) => onAmountRange(minAmount, e.target.value)}
          style={{
            background: "var(--color-sand)",
            border: "none",
            borderRadius: "var(--radius-lg)",
            padding: "10px 14px",
            fontSize: "var(--text-body-sm)",
            fontFamily: "var(--font-body)",
            color: "var(--color-on-surface)",
            outline: "none",
            width: 110,
          }}
        />

        {/* Result count + Reset */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
          <span
            style={{
              fontSize: "var(--text-label-sm)",
              color: "var(--color-secondary)",
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}
          >
            {total} résultat{total !== 1 ? "s" : ""}
          </span>
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="btn-border"
              style={{ gap: 4, fontSize: 12 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
              Réinitialiser
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
