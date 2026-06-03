import { useState, useEffect } from "react";
import { useSettings } from "../hooks/useSettings";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { SkeletonFormSection } from "@/components/ui/Skeleton";
import { toastSuccess, toastError } from "@/components/ui/toast";

export function GeneralSettings() {
  const { settings, isLoading, updateSettings } = useSettings();
  const [formData, setFormData] = useState({
    storeName: "",
    storePhone: "",
    storeAddress: "",
    receiptFooter: "",
    expensesMonthlyBudget: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        storeName: settings.storeName || "",
        storePhone: settings.storePhone || "",
        storeAddress: settings.storeAddress || "",
        receiptFooter: settings.receiptFooter || "",
        expensesMonthlyBudget: settings.expensesMonthlyBudget || "",
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const success = await updateSettings(formData);
    setIsSaving(false);
    if (success) {
      toastSuccess("Paramètres enregistrés", "Les informations du magasin ont été mises à jour.");
    } else {
      toastError("Erreur lors de l'enregistrement", "Veuillez réessayer ou vérifier vos permissions.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonFormSection fields={4} />
        <SkeletonFormSection fields={2} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-[var(--color-bg-elevated)] p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] space-y-4">
        <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
          Informations du magasin
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] -mt-2">
          Ces informations apparaîtront sur les tickets de caisse imprimés.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nom du magasin"
            value={formData.storeName}
            onChange={(e) =>
              setFormData({ ...formData, storeName: e.target.value })
            }
            placeholder="ex. ModaDZ"
          />
          <Input
            label="Téléphone"
            value={formData.storePhone}
            onChange={(e) =>
              setFormData({ ...formData, storePhone: e.target.value })
            }
            placeholder="ex. 0550 000 000"
          />
        </div>
        <Textarea
          label="Adresse"
          value={formData.storeAddress}
          onChange={(e) =>
            setFormData({ ...formData, storeAddress: e.target.value })
          }
          placeholder="ex. 12 Rue Didouche Mourad, Alger"
          rows={2}
        />
      </div>

      <div className="bg-[var(--color-bg-elevated)] p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] space-y-4">
        <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
          Paramètres des tickets
        </h3>
        <Textarea
          label="Message de pied de page"
          value={formData.receiptFooter}
          onChange={(e) =>
            setFormData({ ...formData, receiptFooter: e.target.value })
          }
          placeholder="ex. Merci de votre visite ! Retours acceptés sous 7 jours."
          rows={3}
        />
      </div>

      <div className="bg-[var(--color-bg-elevated)] p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] space-y-4">
        <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
          Budget dépenses
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] -mt-2">
          Utilisé pour les alertes de dépassement mensuel.
        </p>
        <Input
          label="Budget mensuel (DZD)"
          type="number"
          min={0}
          value={formData.expensesMonthlyBudget}
          onChange={(e) =>
            setFormData({ ...formData, expensesMonthlyBudget: e.target.value })
          }
          placeholder="ex. 250000"
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          disabled={isSaving}
          isLoading={isSaving}
          className="min-w-36"
        >
          Enregistrer
        </Button>
      </div>
    </form>
  );
}