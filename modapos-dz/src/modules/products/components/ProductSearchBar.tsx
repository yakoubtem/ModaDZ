import { useEffect, useRef, useState } from "react";
import type { Category } from "@/types";

interface ProductSearchBarProps {
  onSearch: (query: string) => void;
  onCategoryChange: (categoryId: number | undefined) => void;
  categories: Category[];
  value: string;
  categoryId: number | undefined;
}

export function ProductSearchBar({
  onSearch,
  onCategoryChange,
  categories,
  value,
  categoryId,
}: ProductSearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search by 350ms
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch(localValue);
    }, 350);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [localValue, onSearch]);

  const handleClear = () => {
    setLocalValue("");
    onSearch("");
  };

  const hasFilters = localValue || categoryId;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      {/* Search input */}
      <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
        <input
          type="text"
          placeholder="Rechercher par nom ou SKU..."
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          style={{
            width: "100%",
            height: 44,
            paddingLeft: 48,
            paddingRight: localValue ? 36 : 16,
            background: "var(--color-surface)",
            border: "1px solid rgba(208,197,175,0.3)",
            borderRadius: "var(--radius-lg)",
            fontSize: "var(--text-body-sm)",
            fontFamily: "var(--font-body)",
            color: "var(--color-on-surface)",
            outline: "none",
          }}
        />
        {localValue && (
          <button
            onClick={handleClear}
            aria-label="Effacer"
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-secondary)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
          </button>
        )}
      </div>

      {/* Category filter */}
      <select
        value={categoryId?.toString() ?? ""}
        onChange={(e) =>
          onCategoryChange(e.target.value ? parseInt(e.target.value) : undefined)
        }
        style={{
          height: 44,
          padding: "0 16px",
          background: "var(--color-surface)",
          border: "1px solid rgba(208,197,175,0.3)",
          borderRadius: "var(--radius-lg)",
          fontSize: "var(--text-body-sm)",
          fontFamily: "var(--font-body)",
          color: "var(--color-on-surface)",
          outline: "none",
          minWidth: 160,
          cursor: "pointer",
        }}
      >
        <option value="">Toutes catégories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={() => {
            setLocalValue("");
            onSearch("");
            onCategoryChange(undefined);
          }}
          className="btn-border"
          style={{ padding: "8px 14px", fontSize: 12, height: 44, gap: 6 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>filter_list_off</span>
          Effacer
        </button>
      )}
    </div>
  );
}
