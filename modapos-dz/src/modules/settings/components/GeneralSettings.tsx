import { useState, useEffect } from "react";
import { useSettings } from "../hooks/useSettings";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

export function GeneralSettings() {
  const { settings, isLoading, updateSettings } = useSettings();
  const [formData, setFormData] = useState({
    storeName: "",
    storePhone: "",
    storeAddress: "",
    receiptFooter: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        storeName: settings.storeName || "",
        storePhone: settings.storePhone || "",
        storeAddress: settings.storeAddress || "",
        receiptFooter: settings.receiptFooter || "",
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const success = await updateSettings(formData);
    setIsSaving(false);
    if (success) {
      alert("Paramètres enregistrés.");
    } else {
      alert("Erreur lors de l'enregistrement.");
    }
  };

  if (isLoading) return <div>Chargement...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-[var(--color-bg-elevated)] p-6 rounded-lg border border-[var(--color-border)] space-y-4">
        <h3 className="text-lg font-medium">Informations du magasin</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Nom du magasin" 
            value={formData.storeName}
            onChange={(e) => setFormData({...formData, storeName: e.target.value})}
          />
          <Input 
            label="Téléphone" 
            value={formData.storePhone}
            onChange={(e) => setFormData({...formData, storePhone: e.target.value})}
          />
        </div>
        <Textarea 
          label="Adresse" 
          value={formData.storeAddress}
          onChange={(e) => setFormData({...formData, storeAddress: e.target.value})}
        />
      </div>

      <div className="bg-[var(--color-bg-elevated)] p-6 rounded-lg border border-[var(--color-border)] space-y-4">
        <h3 className="text-lg font-medium">Paramètres des tickets</h3>
        <Textarea 
          label="Message de pied de page du ticket (remerciements, politiques de retour, etc.)" 
          value={formData.receiptFooter}
          onChange={(e) => setFormData({...formData, receiptFooter: e.target.value})}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </div>
    </form>
  );
}