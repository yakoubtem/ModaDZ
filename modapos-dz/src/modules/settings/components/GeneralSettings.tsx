import { useState, useEffect } from "react";
import { useSettings } from "../hooks/useSettings";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/modules/auth/AuthContext";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { SkeletonFormSection } from "@/components/ui/Skeleton";
import { toastSuccess, toastError } from "@/components/ui/toast";

export function GeneralSettings() {
  const { settings, isLoading, updateSettings } = useSettings();
  const { t, language, changeLanguage, isRtl } = useTranslation();
  const { user } = useAuth();

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
      toastSuccess(
        t("settings.alerts.success_title"),
        t("settings.alerts.success_desc")
      );
    } else {
      toastError(
        t("settings.alerts.error_title"),
        t("settings.alerts.error_desc")
      );
    }
  };

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as "fr" | "ar";
    const success = await changeLanguage(newLang, user?.id);
    if (success) {
      toastSuccess(
        newLang === "fr" ? "Langue mise à jour" : "تم تحديث اللغة",
        newLang === "fr" ? "L'interface est maintenant en français." : "تم تغيير لغة الواجهة إلى العربية."
      );
    } else {
      toastError(
        newLang === "fr" ? "Erreur" : "خطأ",
        newLang === "fr" ? "Échec du changement de langue" : "فشل تغيير اللغة"
      );
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
      {/* Language selection section */}
      <div
        style={{
          background: "var(--color-surface-container-low)",
          padding: 28,
          borderRadius: "var(--radius-xl)",
          border: "1px solid rgba(208,197,175,0.3)",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          textAlign: isRtl ? "right" : "left",
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
            {t("settings.language_section.title")}
          </h3>
          <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)" }}>
            {t("settings.language_section.desc")}
          </p>
        </div>
        <div style={{ maxWidth: 300, alignSelf: isRtl ? "flex-end" : "flex-start", width: "100%" }}>
          <Select
            label={t("settings.language_section.select_label")}
            value={language}
            onChange={handleLanguageChange}
          >
            <option value="fr">{t("settings.language_section.fr_option")}</option>
            <option value="ar">{t("settings.language_section.ar_option")}</option>
          </Select>
        </div>
      </div>

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
          textAlign: isRtl ? "right" : "left",
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
            {t("settings.store_info.title")}
          </h3>
          <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)" }}>
            {t("settings.store_info.desc")}
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
            label={t("settings.store_info.name")}
            value={formData.storeName}
            onChange={(e) =>
              setFormData({ ...formData, storeName: e.target.value })
            }
            placeholder="ex. ModaDZ"
          />
          <Input
            label={t("settings.store_info.phone")}
            value={formData.storePhone}
            onChange={(e) =>
              setFormData({ ...formData, storePhone: e.target.value })
            }
            placeholder="ex. 0550 000 000"
          />
        </div>
        <Textarea
          label={t("settings.store_info.address")}
          value={formData.storeAddress}
          onChange={(e) =>
            setFormData({ ...formData, storeAddress: e.target.value })
          }
          placeholder={isRtl ? "مثال: 12 شارع ديدوش مراد، الجزائر" : "ex. 12 Rue Didouche Mourad, Alger"}
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
          textAlign: isRtl ? "right" : "left",
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
          {t("settings.receipt.title")}
        </h3>
        <Textarea
          label={t("settings.receipt.footer")}
          value={formData.receiptFooter}
          onChange={(e) =>
            setFormData({ ...formData, receiptFooter: e.target.value })
          }
          placeholder={isRtl ? "مثال: شكراً لزيارتكم! تقبل المرتجعات خلال 7 أيام." : "ex. Merci de votre visite ! Retours acceptés sous 7 jours."}
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
          textAlign: isRtl ? "right" : "left",
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
            {t("settings.budget.title")}
          </h3>
          <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-secondary)" }}>
            {t("settings.budget.desc")}
          </p>
        </div>
        <Input
          label={t("settings.budget.monthly")}
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
      <div style={{ display: "flex", justifyContent: isRtl ? "flex-start" : "flex-end" }}>
        <button
          type="submit"
          className="btn-primary"
          disabled={isSaving}
          style={{ minWidth: 160, padding: "14px 28px", justifyContent: "center" }}
        >
          {isSaving ? (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: 18, animation: "spin 1s linear infinite" }}>progress_activity</span>
              {t("common.buttons.save")}...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span>
              {t("common.buttons.save")}
            </>
          )}
        </button>
      </div>
    </form>
  );
}