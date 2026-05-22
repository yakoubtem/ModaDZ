import { useRef, useEffect, type KeyboardEvent } from "react";
import { Search, X, Scan } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductSearchProps {
  query: string;
  onChange: (q: string) => void;
  onClear: () => void;
  isSearching: boolean;
  // Called from parent when Enter is pressed while a single result is focused
  onEnter?: () => void;
}

/**
 * POS Search bar — supports both keyboard typing and barcode scanner input.
 * Barcode scanners typically send characters very fast + an Enter key.
 * We auto-focus this input on mount and expose a ref to parent via
 * `id="pos-search"` for programmatic focusing (F1 shortcut).
 */
export function ProductSearch({
  query,
  onChange,
  onClear,
  isSearching,
  onEnter,
}: ProductSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onEnter) {
      e.preventDefault();
      onEnter();
    }
    if (e.key === "Escape") {
      onClear();
    }
  };

  return (
    <div className="relative flex items-center">
      {/* Icon */}
      <div className="absolute left-4 flex items-center gap-2 pointer-events-none">
        {isSearching ? (
          <div className="w-4 h-4 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
        ) : (
          <Search className="w-4 h-4 text-[var(--color-text-muted)]" />
        )}
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        id="pos-search"
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Rechercher un produit ou scanner un code-barres…"
        autoComplete="off"
        spellCheck={false}
        className={cn(
          "w-full h-12 pl-11 pr-24 text-sm",
          "bg-[var(--color-bg-elevated)] border border-[var(--color-border)]",
          "rounded-[var(--radius-lg)] text-[var(--color-text-primary)]",
          "placeholder:text-[var(--color-text-muted)]",
          "focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20",
          "transition-all duration-150"
        )}
      />

      {/* Barcode hint + clear */}
      <div className="absolute right-3 flex items-center gap-2">
        {query ? (
          <button
            onClick={onClear}
            className="flex items-center gap-1 px-2 py-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Effacer
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] select-none">
            <Scan className="w-3.5 h-3.5" />
            <span>ou scan code-barres</span>
          </div>
        )}
      </div>
    </div>
  );
}
