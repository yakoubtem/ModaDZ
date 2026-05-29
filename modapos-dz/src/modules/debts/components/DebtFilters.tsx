import type { DebtFilter, DebtSort } from "@/types";

interface DebtFiltersProps {
  search: string;
  filter: DebtFilter;
  sort: DebtSort;
  onSearch: (q: string) => void;
  onFilter: (f: DebtFilter) => void;
  onSort: (s: DebtSort) => void;
}

const FILTER_OPTIONS: { value: DebtFilter; label: string }[] = [
  { value: "all",       label: "Toutes" },
  { value: "with_debt", label: "Avec dette" },
  { value: "no_debt",   label: "Sans dette" },
  { value: "gt_10k",   label: "Dette > 10 000 DZD" },
  { value: "gt_50k",   label: "Dette > 50 000 DZD" },
];

const SORT_OPTIONS: { value: DebtSort; label: string }[] = [
  { value: "debt_desc", label: "Dette décroissante" },
  { value: "debt_asc",  label: "Dette croissante" },
  { value: "name_asc",  label: "Nom A–Z" },
  { value: "name_desc", label: "Nom Z–A" },
];

export function DebtFilters({
  search,
  filter,
  sort,
  onSearch,
  onFilter,
  onSort,
}: DebtFiltersProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        marginBottom: "var(--space-card-gap)",
      }}
    >
      {/* Search + Sort row */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {/* Search bar */}
        <div
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(208,197,175,0.4)",
            borderRadius: "var(--radius-xl)",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "var(--shadow-card)",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 20, color: "var(--color-outline)" }}
          >
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Rechercher par nom ou téléphone..."
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
          {search && (
            <button
              onClick={() => onSearch("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-outline)",
                display: "flex",
                padding: 0,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                close
              </span>
            </button>
          )}
        </div>

        {/* Sort */}
        <div style={{ position: "relative" }}>
          <span
            className="material-symbols-outlined"
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 18,
              color: "var(--color-outline)",
              pointerEvents: "none",
            }}
          >
            sort
          </span>
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value as DebtSort)}
            style={{
              paddingLeft: 36,
              paddingRight: 36,
              paddingTop: 12,
              paddingBottom: 12,
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(208,197,175,0.4)",
              borderRadius: "var(--radius-xl)",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-body-sm)",
              color: "var(--color-on-surface)",
              outline: "none",
              cursor: "pointer",
              appearance: "none",
              boxShadow: "var(--shadow-card)",
              minWidth: 220,
            }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <span
            className="material-symbols-outlined"
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 18,
              color: "var(--color-outline)",
              pointerEvents: "none",
            }}
          >
            expand_more
          </span>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onFilter(opt.value)}
            className={filter === opt.value ? "chip chip-active" : "chip chip-default"}
            style={{ cursor: "pointer", border: "none" }}
          >
            {filter === opt.value && (
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
                check
              </span>
            )}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
