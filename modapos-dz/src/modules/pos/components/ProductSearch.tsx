import { useRef, useEffect, type KeyboardEvent } from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface ProductSearchProps {
  query: string;
  onChange: (q: string) => void;
  onClear: () => void;
  onEnter?: () => void;
}

export function ProductSearch({ query, onChange, onClear, onEnter }: ProductSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t, isRtl } = useTranslation();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onEnter) { e.preventDefault(); onEnter(); }
    if (e.key === "Escape") onClear();
  };

  const paddingLeft = isRtl ? "16px" : "48px";
  const paddingRight = isRtl ? "48px" : "16px";

  return (
    <input
      ref={inputRef}
      id="pos-search"
      type="text"
      value={query}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={t("pos.search_placeholder")}
      autoComplete="off"
      spellCheck={false}
      style={{
        width: "100%",
        background: "#f2ede4",
        border: "none",
        borderRadius: "var(--radius-lg)",
        paddingTop: "16px",
        paddingBottom: "16px",
        paddingLeft,
        paddingRight,
        fontSize: "var(--text-body-md)",
        fontFamily: "var(--font-body)",
        color: "var(--color-on-surface)",
        outline: "none",
        textAlign: isRtl ? "right" : "left",
      }}
    />
  );
}
