import { useState, useEffect } from "react";
import { useSettings } from "../hooks/useSettings";
import { Input } from "@/components/ui/Input";
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
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <SkeletonFormSection fields={4} />
        <SkeletonFormSection fields={2} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Store information section */}
      <div
        style={{
          background: "var(--color-surface-container-low)",
          padding: 28,
          borderRadius: "var(--radius-xl)",
          border: "1px solid rgba(208,197,175,0.3)",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--color-on-surface)",
              fontFamily: "var(--font-display)",
              marginBottom: 4,
            }}
          >
            Informations du magasin
          </h3>
          <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)" }}>
            Ces informations apparaîtront sur les tickets de caisse imprimés.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
          }}
        >
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

      {/* Receipt settings section */}
      <div
        style={{
          background: "var(--color-surface-container-low)",
          padding: 28,
          borderRadius: "var(--radius-xl)",
          border: "1px solid rgba(208,197,175,0.3)",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <h3
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "var(--color-on-surface)",
            fontFamily: "var(--font-display)",
          }}
        >
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

      {/* Budget section */}
      <div
        style={{
          background: "var(--color-surface-container-low)",
          padding: 28,
          borderRadius: "var(--radius-xl)",
          border: "1px solid rgba(208,197,175,0.3)",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--color-on-surface)",
              fontFamily: "var(--font-display)",
              marginBottom: 4,
            }}
          >
            Budget dépenses
          </h3>
          <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)" }}>
            Utilisé pour les alertes de dépassement mensuel.
          </p>
        </div>
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

      {/* Submit */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="submit"
          className="btn-primary"
          disabled={isSaving}
          style={{ minWidth: 160, padding: "14px 28px", justifyContent: "center" }}
        >
          {isSaving ? (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: 18, animation: "spin 1s linear infinite" }}>progress_activity</span>
              Enregistrement…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span>
              Enregistrer
            </>
          )}
        </button>
      </div>
    </form>
  );
}