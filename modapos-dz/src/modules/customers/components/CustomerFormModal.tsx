import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { Customer } from "@/types";

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
      title={isEditing ? `Modifier — ${editCustomer?.name}` : "Nouveau client"}
      description={
        isEditing
          ? "Modifiez les informations du client."
          : "Ajoutez un nouveau client à votre base."
      }
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(handleFormSubmit)}
            isLoading={isSubmitting}
          >
            {isEditing ? "Enregistrer" : "Créer le client"}
          </Button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Input
          label="Nom complet"
          placeholder="ex: Ahmed Belkacem"
          error={errors.name?.message}
          {...register("name", {
            required: "Le nom est obligatoire",
            minLength: { value: 2, message: "Minimum 2 caractères" },
          })}
        />
        <Input
          label="Téléphone"
          type="tel"
          placeholder="ex: 0555 123 456"
          hint="Utilisé pour la recherche rapide en caisse"
          {...register("phone")}
        />
        <Input
          label="Email"
          type="email"
          placeholder="ex: client@email.com"
          {...register("email")}
        />
        <Textarea
          label="Notes"
          placeholder="Informations supplémentaires…"
          rows={3}
          {...register("notes")}
        />
      </div>
    </Modal>
  );
}
