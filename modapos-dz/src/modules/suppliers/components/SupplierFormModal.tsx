import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";
import type { SupplierWithStats, SupplierFormData } from "@/types";

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierFormData) => Promise<boolean>;
  editSupplier: SupplierWithStats | null;
}

export function SupplierFormModal({ isOpen, onClose, onSubmit, editSupplier }: SupplierFormModalProps) {
  const { t, isRtl } = useTranslation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editSupplier) {
      setName(editSupplier.name || "");
      setPhone(editSupplier.phone || "");
      setEmail(editSupplier.email || "");
      setAddress(editSupplier.address || "");
      setNotes(editSupplier.notes || "");
    } else {
      setName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setNotes("");
    }
  }, [editSupplier, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    const success = await onSubmit({
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editSupplier ? t("suppliers.edit_supplier") : t("suppliers.add_supplier")}
      size="md"
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <Input
          label={t("suppliers.table.name") + " *"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("suppliers.form.name_placeholder")}
          required
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Input
            label={t("suppliers.table.phone")}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("suppliers.form.phone_placeholder")}
          />
          <Input
            label={t("suppliers.table.email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("suppliers.form.email_placeholder")}
          />
        </div>
        <Input
          label={t("suppliers.table.address")}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={t("suppliers.form.address_placeholder")}
        />
        <Textarea
          label={t("suppliers.table.notes")}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("suppliers.form.notes_placeholder")}
          rows={3}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px", flexDirection: isRtl ? "row-reverse" : "row" }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("common.buttons.cancel")}
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {t("common.buttons.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
