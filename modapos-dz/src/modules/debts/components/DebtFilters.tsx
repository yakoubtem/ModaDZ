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
  { value: "gt_10k",   label: "> 10 000 DZD" },
  { value: "gt_50k",   label: "> 50 000 DZD" },
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
      {/* Top row: search + sort */}
      <div
        style={{
          display: "flex",
          gap: 0,
          alignItems: "stretch",
          borderBottom: "1px solid rgba(208,197,175,0.2)",
        }}
      >
        {/* Search */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 20px",
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

        {/* Sort select */}
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <span
            className="material-symbols-outlined"
            style={{
              position: "absolute",
              left: 16,
              fontSize: 18,
              color: "var(--color-outline)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            swap_vert
          </span>
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value as DebtSort)}
            style={{
              height: "100%",
              paddingLeft: 44,
              paddingRight: 44,
              background: "transparent",
              border: "none",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-body-sm)",
              fontWeight: 500,
              color: "var(--color-on-surface)",
              outline: "none",
              cursor: "pointer",
              appearance: "none",
              minWidth: 210,
            }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <span
            className="material-symbols-outlined"
            style={{
              position: "absolute",
              right: 14,
              fontSize: 18,
              color: "var(--color-outline)",
              pointerEvents: "none",
            }}
          >
            expand_more
          </span>
        </div>
      </div>

      {/* Filter chips row */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "12px 20px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "var(--text-label-sm)",
            color: "var(--color-secondary)",
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            fontWeight: 700,
            marginRight: 4,
            flexShrink: 0,
          }}
        >
          Filtres
        </span>
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onFilter(opt.value)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 14px",
              borderRadius: "var(--radius-full)",
              border: filter === opt.value
                ? "1.5px solid var(--color-tertiary)"
                : "1.5px solid rgba(208,197,175,0.4)",
              background: filter === opt.value
                ? "rgba(39,104,104,0.08)"
                : "transparent",
              color: filter === opt.value
                ? "var(--color-tertiary)"
                : "var(--color-secondary)",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-label-sm)",
              fontWeight: filter === opt.value ? 700 : 500,
              letterSpacing: "0.03em",
              cursor: "pointer",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
            }}
          >
            {filter === opt.value && (
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>check</span>
            )}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
