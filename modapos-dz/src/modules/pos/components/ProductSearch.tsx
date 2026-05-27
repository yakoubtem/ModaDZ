import { useRef, useEffect, type KeyboardEvent } from "react";

interface ProductSearchProps {
  query: string;
  onChange: (q: string) => void;
  onClear: () => void;
  onEnter?: () => void;
}

export function ProductSearch({ query, onChange, onClear, onEnter }: ProductSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onEnter) { e.preventDefault(); onEnter(); }
    if (e.key === "Escape") onClear();
  };

  return (
    <input
      ref={inputRef}
      id="pos-search"
      type="text"
      value={query}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Recherche produit, code-barres (F1)"
      autoComplete="off"
      spellCheck={false}
      style={{
        width: "100%",
        background: "#f2ede4",
        border: "none",
        borderRadius: "var(--radius-lg)",
        padding: "16px 16px 16px 48px",
        fontSize: "var(--text-body-md)",
        fontFamily: "var(--font-body)",
        color: "var(--color-on-surface)",
        outline: "none",
      }}
    />
  );
}
