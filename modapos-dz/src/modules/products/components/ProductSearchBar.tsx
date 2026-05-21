import { useEffect, useRef, useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";

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
    <div className="flex items-center gap-3">
      {/* Search input */}
      <div className="relative flex items-center flex-1 max-w-sm">
        <Search className="absolute left-3 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
        <input
          type="text"
          placeholder="Rechercher par nom ou SKU..."
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          className={cn(
            "w-full h-9 pl-9 pr-8 bg-[var(--color-bg-elevated)] border border-[var(--color-border)]",
            "rounded-[var(--radius-md)] text-sm text-[var(--color-text-primary)]",
            "placeholder:text-[var(--color-text-muted)]",
            "focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/30",
            "transition-colors duration-150"
          )}
        />
        {localValue && (
          <button
            onClick={handleClear}
            className="absolute right-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="w-44">
        <Select
          value={categoryId?.toString() ?? ""}
          onChange={(e) =>
            onCategoryChange(e.target.value ? parseInt(e.target.value) : undefined)
          }
        >
          <option value="">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      {/* Clear filters */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setLocalValue("");
            onSearch("");
            onCategoryChange(undefined);
          }}
          className="text-[var(--color-text-muted)] gap-1.5"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Effacer
        </Button>
      )}
    </div>
  );
}
