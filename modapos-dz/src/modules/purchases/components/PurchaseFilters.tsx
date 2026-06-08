import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { SupplierWithStats } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

interface PurchaseFiltersProps {
  search: string;
  supplierId?: number;
  status: "all" | "paid" | "partial" | "unpaid";
  from: string;
  to: string;
  suppliers: SupplierWithStats[];
  onSearch: (q: string) => void;
  onSupplierChange: (sid: number | undefined) => void;
  onStatusChange: (st: "all" | "paid" | "partial" | "unpaid") => void;
  onDateRange: (from: string, to: string) => void;
}

export function PurchaseFilters({
  search,
  supplierId,
  status,
  from,
  to,
  suppliers,
  onSearch,
  onSupplierChange,
  onStatusChange,
  onDateRange,
}: PurchaseFiltersProps) {
  const { t } = useTranslation();
  const hasActiveFilters = search || supplierId !== undefined || status !== "all" || from || to;

  const handleReset = () => {
    onSearch("");
    onSupplierChange(undefined);
    onStatusChange("all");
    onDateRange("", "");
  };

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid var(--color-surface-variant)",
        borderRadius: "var(--radius-xl)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        marginBottom: "24px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <div>
          <Input
            placeholder={t("purchases.search_placeholder") || "Rechercher par référence..."}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            leftIcon={<span className="material-symbols-outlined text-sm">search</span>}
          />
        </div>

        <div>
          <Select
            value={supplierId !== undefined ? String(supplierId) : ""}
            onChange={(e) => {
              const val = e.target.value;
              onSupplierChange(val ? Number(val) : undefined);
            }}
          >
            <option value="">{t("purchases.form.select_supplier") || "Tous les fournisseurs"}</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as any)}
          >
            <option value="all">{t("purchases.status.all") || "Tous les statuts"}</option>
            <option value="paid">{t("purchases.status.paid")}</option>
            <option value="partial">{t("purchases.status.partial")}</option>
            <option value="unpaid">{t("purchases.status.unpaid")}</option>
          </Select>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Input
            type="date"
            value={from}
            onChange={(e) => onDateRange(e.target.value, to)}
            style={{ flex: 1 }}
          />
          <span style={{ color: "var(--color-outline)", fontSize: "14px" }}>→</span>
          <Input
            type="date"
            value={to}
            onChange={(e) => onDateRange(from, e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={handleReset}
            className="btn-border"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              fontSize: "var(--text-label-sm)",
              cursor: "pointer",
            }}
          >
            <span className="material-symbols-outlined text-sm" style={{ fontSize: "16px" }}>
              close
            </span>
            Réinitialiser
          </button>
        </div>
      )}
    </div>
  );
}
