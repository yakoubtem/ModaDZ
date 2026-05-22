import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { User } from "@/types";

interface Props {
  user?: User;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export function UserFormModal({ user, onClose, onSave }: Props) {
  const [formData, setFormData] = useState({
    name: "",
    pin: "",
    role: "cashier"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        pin: "", // Don't show existing pin
        role: user.role
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert("Le nom est requis.");
    if (!user && !formData.pin) return alert("Le code PIN est requis pour un nouvel utilisateur.");
    
    setIsSubmitting(true);
    
    // Only send pin if it's new or being changed
    const submitData: any = { 
      name: formData.name, 
      role: formData.role 
    };
    if (formData.pin) submitData.pin = formData.pin;
    
    await onSave(submitData);
    setIsSubmitting(false);
  };

  return (
    <Modal
      title={user ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
      isOpen={true}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <Input
          label="Nom complet"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        
        <Select
          label="Rôle"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          options={[
            { value: "cashier", label: "Caissier (Caisse uniquement)" },
            { value: "admin", label: "Administrateur (Accès complet)" }
          ]}
        />

        <Input
          label={user ? "Nouveau code PIN (laisser vide pour ne pas changer)" : "Code PIN (4-6 chiffres)"}
          type="password"
          value={formData.pin}
          onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
          required={!user}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}