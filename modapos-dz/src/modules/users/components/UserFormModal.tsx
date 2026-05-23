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
    username: "",
    password: "",
    role: "cashier"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        username: user.username || "",
        password: "", // Don't show existing password
        role: user.role
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert("Le nom est requis.");
    if (!formData.username) return alert("Le nom d'utilisateur est requis.");
    if (!user && !formData.password) return alert("Le mot de passe est requis pour un nouvel utilisateur.");
    
    setIsSubmitting(true);
    
    // Only send password if it's new or being changed
    const submitData: any = { 
      name: formData.name, 
      username: formData.username,
      role: formData.role 
    };
    if (formData.password) submitData.password = formData.password;
    
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
        
        <Input
          label="Nom d'utilisateur"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
        />
        
        <Select
          label="Rôle"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        >
          <option value="cashier">Caissier (Caisse uniquement)</option>
          <option value="admin">Administrateur (Accès complet)</option>
        </Select>

        <Input
          label={user ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe"}
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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