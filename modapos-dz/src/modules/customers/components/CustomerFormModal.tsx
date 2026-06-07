import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { Customer } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<CustomerFormData, "notes" | "phone" | "email"> & {
    phone?: string;
    email?: string;
    notes?: string;
  }) => Promise<boolean>;
  editCustomer?: Customer | null;
}

export function CustomerFormModal({
  isOpen,
  onClose,
  onSubmit,
  editCustomer,
}: CustomerFormModalProps) {
  const { t } = useTranslation();
  const isEditing = !!editCustomer;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    defaultValues: { name: "", phone: "", email: "", notes: "" },
  });

  useEffect(() => {
    if (isOpen) {
      if (editCustomer) {
        reset({
          name: editCustomer.name,
          phone: editCustomer.phone ?? "",
          email: editCustomer.email ?? "",
          notes: editCustomer.notes ?? "",
        });
      } else {
        reset({ name: "", phone: "", email: "", notes: "" });
      }
    }
  }, [isOpen, editCustomer, reset]);

  const handleFormSubmit = async (data: CustomerFormData) => {
    const success = await onSubmit({
      name: data.name,
      phone: data.phone.trim() || undefined,
      email: data.email.trim() || undefined,
      notes: data.notes.trim() || undefined,
    });
    if (success) {
      onClose();
      reset();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? t("customers.form.edit_title", { name: editCustomer?.name ?? "" }) : t("customers.form.add_title")}
      description={
        isEditing
          ? t("customers.form.edit_description")
          : t("customers.form.add_description")
      }
      size="md"
      scrollable
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            {t("common.buttons.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(handleFormSubmit)}
            isLoading={isSubmitting}
          >
            {isEditing ? t("common.buttons.save") : t("customers.form.create_btn")}
          </Button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Input
          label={t("customers.form.name")}
          placeholder={t("customers.form.name_placeholder")}
          error={errors.name?.message}
          {...register("name", {
            required: t("customers.form.error_name_required"),
            minLength: { value: 2, message: t("customers.form.error_name_min") },
          })}
        />
        <Input
          label={t("customers.form.phone")}
          type="tel"
          placeholder={t("customers.form.phone_placeholder")}
          hint={t("customers.form.phone_hint")}
          {...register("phone")}
        />
        <Input
          label={t("customers.form.email")}
          type="email"
          placeholder={t("customers.form.email_placeholder")}
          {...register("email")}
        />
        <Textarea
          label={t("customers.form.notes")}
          placeholder={t("customers.form.notes_placeholder")}
          rows={3}
          {...register("notes")}
        />
      </div>
    </Modal>
  );
}
