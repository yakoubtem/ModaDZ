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
      title={isEdit ? "Modifier la dépense" : "Nouvelle dépense"}
      description={isEdit ? "Modifiez les détails de cette dépense." : "Enregistrez une nouvelle dépense."}
      size="xl"
      scrollable
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
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
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Titre *"
            placeholder="Ex: Loyer du mois"
            error={errors.title?.message}
            {...register("title", { required: "Le titre est requis" })}
          />
          <Input
            label="Montant (DA) *"
            type="number"
            step="0.01"
            error={errors.amount?.message}
            {...register("amount", {
              required: "Le montant est requis",
              valueAsNumber: true,
              validate: (v) => v > 0 || "Le montant doit etre superieur a 0",
            })}
          />
          <Input
            label="Fournisseur"
            placeholder="Ex: Sonelgaz"
            {...register("supplier")}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Select
            label="Categorie *"
            error={errors.category?.message}
            {...register("category", { required: "La categorie est requise" })}
          >
            <option value="">Selectionner...</option>
            {categories.filter((c) => !c.isArchived).map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </Select>
          <Input
            label="Date *"
            type="date"
            error={errors.expenseDate?.message}
            {...register("expenseDate", { required: "La date est requise" })}
          />
          <Select label="Mode de paiement" {...register("paymentMethod")}>
            <option value="">Aucun</option>
            {EXPENSE_PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Textarea label="Description" rows={3} {...register("description")} />
          <Textarea label="Notes" rows={3} {...register("notes")} />
        </div>

        <ExpenseReceiptUpload
          value={receiptPath}
          onChange={(path) => setValue("receiptPath", path)}
        />
      </form>
    </Modal>
  );
}
