import { useState, useEffect } from "react";
import {
  ShieldCheck,
  User2,
  KeyRound,
  UserCog,
  Sparkles,
} from "lucide-react";

import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
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
    role: "cashier",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        username: user.username || "",
        password: "",
        role: user.role,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name)
      return alert("Le nom est requis.");

    if (!formData.username)
      return alert("Le nom d'utilisateur est requis.");

    if (!user && !formData.password)
      return alert(
        "Le mot de passe est requis pour un nouvel utilisateur."
      );

    setIsSubmitting(true);

    const submitData: any = {
      name: formData.name,
      username: formData.username,
      role: formData.role,
    };

    if (formData.password) {
      submitData.password = formData.password;
    }

    await onSave(submitData);

    setIsSubmitting(false);
  };

  return (
    <Modal
      title=""
      isOpen={true}
      onClose={onClose}
      size="md"
    >
      <div className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-16 h-52 w-52 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-yellow-300/5 blur-3xl" />
        </div>

        {/* Header */}
        <div className="relative" style={{ padding: "32px 32px 24px" }}>
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center",
                "rounded-2xl border border-amber-500/20",
                "bg-gradient-to-br from-amber-400/20 to-yellow-500/10",
                "shadow-lg shadow-amber-500/10"
              )}
            >
              <UserCog className="h-7 w-7 text-amber-300" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-[22px] font-semibold tracking-tight text-white">
                  {user
                    ? "Modifier l'utilisateur"
                    : "Nouvel utilisateur"}
                </h2>

                <Sparkles className="h-4 w-4 text-amber-300" />
              </div>

              <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                Configurez les informations d’accès et le rôle
                de cet utilisateur dans le système ModaDZ.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="relative"
          style={{ padding: "28px 32px" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Name */}
            <div
              className={cn(
                "rounded-2xl border border-white/10",
                "bg-white/[0.03] backdrop-blur-xl"
              )}
              style={{ padding: 20 }}
            >
              <div className="mb-3 flex items-center gap-2">
                <User2 className="h-4 w-4 text-amber-300" />

                <p className="text-sm font-medium text-zinc-200">
                  Informations personnelles
                </p>
              </div>

              <Input
                label="Nom complet"
                placeholder="Ex: Ahmed Benyahia"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                required
              />
            </div>

            {/* Credentials */}
            <div
              className={cn(
                "rounded-2xl border border-white/10",
                "bg-white/[0.03] backdrop-blur-xl"
              )}
              style={{ padding: 20 }}
            >
              <div className="mb-3 flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-amber-300" />

                <p className="text-sm font-medium text-zinc-200">
                  Authentification
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <Input
                  label="Nom d'utilisateur"
                  placeholder="Ex: yakoub_admin"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      username: e.target.value,
                    })
                  }
                  required
                />

                <Input
                  label={
                    user
                      ? "Nouveau mot de passe"
                      : "Mot de passe"
                  }
                  hint={
                    user
                      ? "Laissez vide pour conserver le mot de passe actuel."
                      : undefined
                  }
                  type="password"
                  placeholder={
                    user
                      ? "••••••••"
                      : "Créer un mot de passe sécurisé"
                  }
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                  required={!user}
                />
              </div>
            </div>

            {/* Role */}
            <div
              className={cn(
                "rounded-2xl border border-white/10",
                "bg-white/[0.03] backdrop-blur-xl"
              )}
              style={{ padding: 20 }}
            >
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-300" />

              <p className="text-sm font-medium text-zinc-200">
                Permissions & rôle
              </p>
            </div>

            <Select
              label="Rôle utilisateur"
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value,
                })
              }
            >
              <option value="cashier">
                Caissier — accès POS et clients
              </option>

              <option value="manager">
                Manager — gestion boutique
              </option>

              <option value="admin">
                Administrateur — accès complet
              </option>
            </Select>

            <div className="mt-4 rounded-xl border border-amber-500/10 bg-amber-500/5 p-3">
              <p className="text-xs leading-relaxed text-zinc-400">
                {formData.role === "admin" && "Les administrateurs ont un accès complet au système, aux utilisateurs, paramètres et sauvegardes."}
                {formData.role === "manager" && "Les managers gèrent le catalogue, les stocks, les dettes et les dépenses, mais n'ont pas accès à la configuration système."}
                {formData.role === "cashier" && "Les caissiers sont limités aux ventes journalières (POS), à la sélection des clients et à la réception des paiements."}
              </p>
            </div>
          </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
          className="min-w-[120px]"
        >
          Annuler
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "min-w-[160px]",
            "bg-gradient-to-r from-amber-400 to-yellow-500",
            "text-black hover:opacity-90"
          )}
        >
          {isSubmitting
            ? "Enregistrement..."
            : user
              ? "Mettre à jour"
              : "Créer l'utilisateur"}
        </Button>
      </div>
    </form>
      </div >
    </Modal >
  );
}