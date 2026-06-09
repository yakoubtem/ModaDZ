import { useState, useEffect } from "react";
import { useIPC } from "@/hooks/useIPC";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { User, CashMovementTypeFilter } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

interface MovementsFiltersProps {
  typeFilter: CashMovementTypeFilter;
  userFilter?: number;
  from: string;
  to: string;
  onTypeChange: (t: CashMovementTypeFilter) => void;
  onUserChange: (uid: number | undefined) => void;
  onDateRange: (from: string, to: string) => void;
  onReset: () => void;
}

export function MovementsFilters({
  typeFilter,
  userFilter,
  from,
  to,
  onTypeChange,
  onUserChange,
  onDateRange,
  onReset,
}: MovementsFiltersProps) {
  const { t, isRtl } = useTranslation();
  const api = useIPC();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    api<User[]>("users:getAll")
      .then(setUsers)
      .catch(() => {});
  }, [api]);

  const hasActiveFilters = typeFilter !== "all" || userFilter !== undefined || from || to;

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
          flexDirection: isRtl ? "row-reverse" : "row",
        }}
      >
        {/* Cashier dropdown */}
        <div>
          <Select
            value={userFilter !== undefined ? String(userFilter) : ""}
            onChange={(e) => {
              const val = e.target.value;
              onUserChange(val ? Number(val) : undefined);
            }}
          >
            <option value="">{t("cashRegister.tables.user") + ": " + t("common.all", { defaultValue: "Tous" })}</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Movement Type dropdown */}
        <div>
          <Select
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value as CashMovementTypeFilter)}
          >
            <option value="all">{t("cashRegister.types.all", { defaultValue: "Tous les types" })}</option>
            <option value="sale">{t("cashRegister.types.sale")}</option>
            <option value="refund">{t("cashRegister.types.refund")}</option>
            <option value="expense">{t("cashRegister.types.expense")}</option>
            <option value="supplier_payment">{t("cashRegister.types.supplier_payment")}</option>
            <option value="cash_in">{t("cashRegister.types.cash_in")}</option>
            <option value="cash_out">{t("cashRegister.types.cash_out")}</option>
          </Select>
        </div>

        {/* Date Inputs */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
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
        <div style={{ display: "flex", justifyContent: isRtl ? "flex-start" : "flex-end" }}>
          <button
            onClick={onReset}
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
            {t("common.reset", { defaultValue: "Réinitialiser" })}
          </button>
        </div>
      )}
    </div>
  );
}
