import type { SupplierDebtFilter, SupplierDebtSort } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

interface SupplierDebtFiltersProps {
  search: string;
  filter: SupplierDebtFilter;
  sort: SupplierDebtSort;
  onSearch: (q: string) => void;
  onFilter: (f: SupplierDebtFilter) => void;
  onSort: (s: SupplierDebtSort) => void;
}

export function SupplierDebtFilters({
  search,
  filter,
  sort,
  onSearch,
  onFilter,
  onSort,
}: SupplierDebtFiltersProps) {
  const { t, isRtl } = useTranslation();

  const FILTER_OPTIONS: { value: SupplierDebtFilter; label: string }[] = [
    { value: "all",       label: t("supplierDebts.filters.all") },
    { value: "with_debt", label: t("supplierDebts.filters.with_debt") },
    { value: "no_debt",   label: t("supplierDebts.filters.no_debt") },
    { value: "gt_10k",    label: "> 10 000 DZD" },
    { value: "gt_50k",    label: "> 50 000 DZD" },
  ];

  const SORT_OPTIONS: { value: SupplierDebtSort; label: string }[] = [
    { value: "debt_desc", label: t("supplierDebts.filters.debt_desc") },
    { value: "debt_asc",  label: t("supplierDebts.filters.debt_asc") },
    { value: "name_asc",  label: t("supplierDebts.filters.name_asc") },
    { value: "name_desc", label: t("supplierDebts.filters.name_desc") },
  ];

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
          flexDirection: isRtl ? "row-reverse" : "row",
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
            flexDirection: isRtl ? "row-reverse" : "row",
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
            placeholder={t("supplierDebts.filters.search_placeholder")}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: "var(--text-body-md)",
              fontFamily: "var(--font-body)",
              color: "var(--color-on-surface)",
              textAlign: isRtl ? "right" : "left",
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
              [isRtl ? "right" : "left"]: 16,
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
            onChange={(e) => onSort(e.target.value as SupplierDebtSort)}
            style={{
              height: "100%",
              paddingLeft: isRtl ? 16 : 44,
              paddingRight: isRtl ? 44 : 16,
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
              textAlign: isRtl ? "right" : "left",
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
              [isRtl ? "left" : "right"]: 14,
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
          flexDirection: isRtl ? "row-reverse" : "row",
        }}
      >
        <span
          style={{
            fontSize: "var(--text-label-sm)",
            color: "var(--color-secondary)",
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            fontWeight: 700,
            [isRtl ? "marginLeft" : "marginRight"]: 4,
            flexShrink: 0,
          }}
        >
          {t("supplierDebts.filters.filters_label")}
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
