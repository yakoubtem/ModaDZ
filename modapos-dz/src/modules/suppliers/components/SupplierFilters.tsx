import { useTranslation } from "@/hooks/useTranslation";

interface SupplierFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
}

export function SupplierFilters({ search, onSearchChange }: SupplierFiltersProps) {
  const { t, isRtl } = useTranslation();

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid var(--color-surface-variant)",
        borderRadius: "var(--radius-xl)",
        padding: "16px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <span className="material-symbols-outlined" style={{ color: "var(--color-outline)" }}>
        search
      </span>
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={t("suppliers.search_placeholder")}
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
    </div>
  );
}
