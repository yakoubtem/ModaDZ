import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { EXPENSE_CATEGORIES, EXPENSE_PAYMENT_METHODS } from "@/types";
import type { Expense, ExpenseFormData } from "@/types";

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => Promise<boolean>;
  expense?: Expense | null;
}

export function ExpenseFormModal({ isOpen, onClose, onSubmit, expense }: ExpenseFormModalProps) {
  const isEdit = !!expense;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormData>({
    defaultValues: {
      title: "",
      amount: 0,
      category: "",
      expenseDate: new Date().toISOString().split("T")[0],
      paymentMethod: "",
      description: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (expense) {
        reset({
          title: expense.title,
          amount: expense.amount,
          category: expense.category,
          expenseDate: expense.expenseDate
            ? new Date(expense.expenseDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          paymentMethod: expense.paymentMethod ?? "",
          description: expense.description ?? "",
        });
      } else {
        reset({
          title: "",
          amount: 0,
          category: "",
          expenseDate: new Date().toISOString().split("T")[0],
          paymentMethod: "",
          description: "",
        });
      }
    }
  }, [isOpen, expense, reset]);

  const onFormSubmit = async (data: ExpenseFormData) => {
    const success = await onSubmit(data);
    if (success) onClose();
  };

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--color-sand)",
    border: "none",
    borderRadius: "var(--radius-lg)",
    padding: "12px 16px",
    fontSize: "var(--text-body-sm)",
    fontFamily: "var(--font-body)",
    color: "var(--color-on-surface)",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "var(--text-label-sm)",
    fontWeight: "var(--fw-label-sm)",
    letterSpacing: "var(--ls-label-sm)",
    color: "var(--color-secondary)",
    textTransform: "uppercase",
    marginBottom: 6,
    display: "block",
  };

  const errorStyle: React.CSSProperties = {
    fontSize: 12,
    color: "var(--color-error)",
    marginTop: 4,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Modifier la dépense" : "Nouvelle dépense"}
      description={isEdit ? "Modifiez les détails de cette dépense." : "Enregistrez une nouvelle dépense."}
      size="lg"
      scrollable
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(onFormSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="material-symbols-outlined" style={{ fontSize: 18, animation: "spin 1s linear infinite" }}>
                progress_activity
              </span>
            ) : null}
            {isEdit ? "Enregistrer" : "Ajouter"}
          </Button>
        </>
      }
    >
      <form
        onSubmit={handleSubmit(onFormSubmit)}
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        {/* Row: Title + Amount */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>Titre *</label>
            <input
              {...register("title", { required: "Le titre est requis" })}
              style={{
                ...fieldStyle,
                borderBottom: errors.title ? "2px solid var(--color-error)" : undefined,
              }}
              placeholder="Ex: Loyer du mois"
            />
            {errors.title && <p style={errorStyle}>{errors.title.message}</p>}
          </div>
          <div>
            <label style={labelStyle}>Montant (DA) *</label>
            <input
              type="number"
              step="0.01"
              {...register("amount", {
                required: "Le montant est requis",
                valueAsNumber: true,
                validate: (v) => v > 0 || "Le montant doit être supérieur à 0",
              })}
              style={{
                ...fieldStyle,
                borderBottom: errors.amount ? "2px solid var(--color-error)" : undefined,
              }}
              placeholder="0"
            />
            {errors.amount && <p style={errorStyle}>{errors.amount.message}</p>}
          </div>
        </div>

        {/* Row: Category + Date */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>Catégorie *</label>
            <select
              {...register("category", { required: "La catégorie est requise" })}
              style={{
                ...fieldStyle,
                cursor: "pointer",
                borderBottom: errors.category ? "2px solid var(--color-error)" : undefined,
              }}
            >
              <option value="">Sélectionner…</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.category && <p style={errorStyle}>{errors.category.message}</p>}
          </div>
          <div>
            <label style={labelStyle}>Date *</label>
            <input
              type="date"
              {...register("expenseDate", { required: "La date est requise" })}
              style={{
                ...fieldStyle,
                borderBottom: errors.expenseDate ? "2px solid var(--color-error)" : undefined,
              }}
            />
            {errors.expenseDate && <p style={errorStyle}>{errors.expenseDate.message}</p>}
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label style={labelStyle}>Mode de paiement</label>
          <select
            {...register("paymentMethod")}
            style={{ ...fieldStyle, cursor: "pointer" }}
          >
            <option value="">Aucun</option>
            {EXPENSE_PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            {...register("description")}
            rows={3}
            style={{
              ...fieldStyle,
              resize: "vertical",
              minHeight: 80,
            }}
            placeholder="Notes supplémentaires…"
          />
        </div>
      </form>
    </Modal>
  );
}
