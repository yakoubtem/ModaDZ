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
    <div className="bg-[var(--color-bg-elevated)]/80 backdrop-blur border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 space-y-4">
      {/* Row 1: Search + Sort */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px]">
          <Input
            placeholder={t("expenses.filters.search_placeholder")}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            leftIcon={<span className="material-symbols-outlined text-sm">search</span>}
          />
        </div>
        <div className="flex gap-1 bg-[var(--color-surface-container-high)] rounded-[var(--radius-lg)] p-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSort(opt.value)}
              className={`px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold transition-all ${
                sort === opt.value
                  ? "bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)] shadow-[var(--shadow-soft)]"
                  : "text-[var(--color-secondary)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: Filters */}
      <div className="grid grid-cols-1 xl:grid-cols-6 gap-3">
        <Select value={category} onChange={(e) => onCategory(e.target.value)}>
          <option value="">{t("expenses.filters.all_categories")}</option>
          {categories.filter((c) => !c.isArchived).map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </Select>

        <Input
          placeholder={t("expenses.filters.supplier")}
          value={supplier}
          onChange={(e) => onSupplier(e.target.value)}
        />

        <Select value={paymentMethod} onChange={(e) => onPaymentMethod(e.target.value)}>
          <option value="">{t("expenses.filters.all_payments")}</option>
          {paymentMethods.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>

        <Input type="date" value={from} onChange={(e) => onDateRange(e.target.value, to)} />
        <Input type="date" value={to} onChange={(e) => onDateRange(from, e.target.value)} />

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
