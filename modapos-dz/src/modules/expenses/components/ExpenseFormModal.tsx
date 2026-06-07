import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { ExpenseReceiptUpload } from "./ExpenseReceiptUpload";
import { EXPENSE_PAYMENT_METHODS } from "@/types";
import type { Expense, ExpenseFormData } from "@/types";
import type { ExpenseCategoryRecord } from "@/types";
import { useIPC } from "@/hooks/useIPC";
import { useTranslation } from "@/hooks/useTranslation";

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => Promise<boolean>;
  expense?: Expense | null;
  categories: ExpenseCategoryRecord[];
}

export function ExpenseFormModal({ isOpen, onClose, onSubmit, expense, categories }: ExpenseFormModalProps) {
  const isEdit = !!expense;
  const api = useIPC();
  const { t } = useTranslation();
  const initialReceiptRef = useRef<string | undefined>(undefined);
  const [didSubmit, setDidSubmit] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormData>({
    defaultValues: {
      title: "",
      amount: 0,
      category: "",
      expenseDate: new Date().toISOString().split("T")[0],
      paymentMethod: "",
      description: "",
      supplier: "",
      notes: "",
      receiptPath: undefined,
    },
  });

  useEffect(() => {
    if (isOpen) {
      setDidSubmit(false);
      if (expense) {
        initialReceiptRef.current = expense.receiptPath ?? undefined;
        reset({
          title: expense.title,
          amount: expense.amount,
          category: expense.category,
          expenseDate: expense.expenseDate
            ? new Date(expense.expenseDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          paymentMethod: expense.paymentMethod ?? "",
          description: expense.description ?? "",
          supplier: expense.supplier ?? "",
          notes: expense.notes ?? "",
          receiptPath: expense.receiptPath ?? undefined,
        });
      } else {
        initialReceiptRef.current = undefined;
        reset({
          title: "",
          amount: 0,
          category: "",
          expenseDate: new Date().toISOString().split("T")[0],
          paymentMethod: "",
          description: "",
          supplier: "",
          notes: "",
          receiptPath: undefined,
        });
      }
    }
  }, [isOpen, expense, reset]);

  const onFormSubmit = async (data: ExpenseFormData) => {
    const success = await onSubmit(data);
    if (success) {
      const initialReceipt = initialReceiptRef.current;
      if (initialReceipt && initialReceipt !== data.receiptPath) {
        await api("expenses:deleteReceipt", initialReceipt);
      }
      setDidSubmit(true);
      onClose();
    }
  };

  const handleClose = async () => {
    const currentReceipt = getValues("receiptPath");
    if (!didSubmit) {
      if (currentReceipt && currentReceipt !== initialReceiptRef.current) {
        await api("expenses:deleteReceipt", currentReceipt);
      }
    }
    onClose();
  };

  const receiptPath = watch("receiptPath");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? t("expenses.form.edit_title") : t("expenses.form.title")}
      description={isEdit ? t("expenses.form.edit_title_desc") : t("expenses.form.title_desc")}
      size="xl"
      scrollable
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            {t("common.buttons.cancel")}
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
            {isEdit ? t("common.buttons.save") : t("common.buttons.add")}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onFormSubmit)} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ gridColumn: "span 2" }}>
            <Input
              label={t("expenses.form.expense_title")}
              placeholder={t("expenses.form.expense_title_placeholder")}
              error={errors.title?.message}
              {...register("title", { required: t("expenses.form.validation.title_required") })}
            />
          </div>
          <Input
            label={t("expenses.form.amount")}
            type="number"
            step="0.01"
            error={errors.amount?.message}
            {...register("amount", {
              required: t("expenses.form.validation.amount_required"),
              valueAsNumber: true,
              validate: (v) => v > 0 || t("expenses.form.validation.amount_positive"),
            })}
          />
          <Select
            label={t("expenses.form.category")}
            error={errors.category?.message}
            {...register("category", { required: t("expenses.form.validation.category_required") })}
          >
            <option value="">{t("expenses.form.category_select")}</option>
            {categories.filter((c) => !c.isArchived).map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </Select>
          <Input
            label={t("expenses.form.supplier")}
            placeholder={t("expenses.form.supplier_placeholder")}
            {...register("supplier")}
          />
          <Select label={t("expenses.form.payment_method")} {...register("paymentMethod")}>
            <option value="">{t("expenses.form.payment_method_none")}</option>
            {EXPENSE_PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
          <div style={{ gridColumn: "span 2" }}>
            <Input
              label={t("expenses.form.date")}
              type="date"
              error={errors.expenseDate?.message}
              {...register("expenseDate", { required: t("expenses.form.validation.date_required") })}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Textarea label={t("expenses.form.description")} rows={3} {...register("description")} />
          <Textarea label={t("expenses.form.notes")} rows={3} {...register("notes")} />
        </div>

        <ExpenseReceiptUpload
          value={receiptPath}
          onChange={(path) => setValue("receiptPath", path)}
        />
      </form>
    </Modal>
  );
}
