import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { ExpenseCategoryRecord, ExpenseSort } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

interface ExpenseFiltersProps {
  search: string;
  category: string;
  supplier: string;
  paymentMethod: string;
  from: string;
  to: string;
  minAmount: string;
  maxAmount: string;
  sort: ExpenseSort;
  categories: ExpenseCategoryRecord[];
  paymentMethods: string[];
  onSearch: (q: string) => void;
  onCategory: (c: string) => void;
  onSupplier: (s: string) => void;
  onPaymentMethod: (m: string) => void;
  onDateRange: (from: string, to: string) => void;
  onAmountRange: (min: string, max: string) => void;
  onSort: (s: ExpenseSort) => void;
  onReset: () => void;
  total: number;
}

export function ExpenseFilters({
  search,
  category,
  supplier,
  paymentMethod,
  from,
  to,
  minAmount,
  maxAmount,
  sort,
  categories,
  paymentMethods,
  onSearch,
  onCategory,
  onSupplier,
  onPaymentMethod,
  onDateRange,
  onAmountRange,
  onSort,
  onReset,
  total,
}: ExpenseFiltersProps) {
  const { t } = useTranslation();
  const hasActiveFilters = category || from || to || minAmount || maxAmount || search || supplier || paymentMethod;

  const sortOptions: { value: ExpenseSort; label: string }[] = [
    { value: "newest", label: t("expenses.filters.sort.newest") },
    { value: "oldest", label: t("expenses.filters.sort.oldest") },
    { value: "highest", label: t("expenses.filters.sort.highest") },
    { value: "lowest", label: t("expenses.filters.sort.lowest") },
  ];
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "var(--radius-xl)",
        border: "1px solid rgba(208, 197, 175, 0.35)",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      {/* Row 1: Search + Sort */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", justifyContent: "space-between" }}>
        <div style={{ flex: 1, minWidth: "260px" }}>
          <Input
            placeholder={t("expenses.filters.search_placeholder")}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            leftIcon={<span className="material-symbols-outlined text-sm">search</span>}
          />
        </div>
        <div
          style={{
            display: "flex",
            gap: "4px",
            background: "var(--color-surface-container-high)",
            borderRadius: "var(--radius-lg)",
            padding: "4px",
            alignItems: "center",
          }}
        >
          {sortOptions.map((opt) => {
            const isActive = sort === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onSort(opt.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "var(--radius-md)",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  border: "none",
                  background: isActive ? "var(--color-surface-container-lowest)" : "transparent",
                  color: isActive ? "var(--color-on-surface)" : "var(--color-secondary)",
                  boxShadow: isActive ? "var(--shadow-soft)" : "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 2: Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-[var(--color-secondary)] uppercase tracking-wider">
            {t("expenses.filters.category_label")}
          </label>
          <Select value={category} onChange={(e) => onCategory(e.target.value)}>
            <option value="">{t("expenses.filters.all_categories")}</option>
            {categories.filter((c) => !c.isArchived).map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Supplier */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-[var(--color-secondary)] uppercase tracking-wider">
            {t("expenses.filters.supplier_label")}
          </label>
          <Input
            placeholder={t("expenses.filters.supplier")}
            value={supplier}
            onChange={(e) => onSupplier(e.target.value)}
          />
        </div>

        {/* Payment Method */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-[var(--color-secondary)] uppercase tracking-wider">
            {t("expenses.filters.payment_label")}
          </label>
          <Select value={paymentMethod} onChange={(e) => onPaymentMethod(e.target.value)}>
            <option value="">{t("expenses.filters.all_payments")}</option>
            {paymentMethods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </div>

        {/* Date From */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-[var(--color-secondary)] uppercase tracking-wider">
            {t("expenses.filters.date_from")}
          </label>
          <Input type="date" value={from} onChange={(e) => onDateRange(e.target.value, to)} />
        </div>

        {/* Date To */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-[var(--color-secondary)] uppercase tracking-wider">
            {t("expenses.filters.date_to")}
          </label>
          <Input type="date" value={to} onChange={(e) => onDateRange(from, e.target.value)} />
        </div>

        {/* Amount Range */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-[var(--color-secondary)] uppercase tracking-wider">
            {t("expenses.filters.amount_range")}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder={t("expenses.filters.min_amount")}
              value={minAmount}
              onChange={(e) => onAmountRange(e.target.value, maxAmount)}
            />
            <Input
              type="number"
              placeholder={t("expenses.filters.max_amount")}
              value={maxAmount}
              onChange={(e) => onAmountRange(minAmount, e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-[var(--color-text-secondary)]">
          {t(total === 1 ? "expenses.filters.results" : "expenses.filters.results_plural", { count: total })}
        </span>
        {hasActiveFilters && (
          <button onClick={onReset} className="btn-border text-xs px-3 py-1.5">
            <span className="material-symbols-outlined text-sm">close</span>
            {t("expenses.filters.reset")}
          </button>
        )}
      </div>
    </div>
  );
}
