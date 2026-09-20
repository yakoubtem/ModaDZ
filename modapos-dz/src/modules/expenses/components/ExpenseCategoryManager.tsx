import { useMemo, useState } from "react";
import type { ExpenseCategoryRecord } from "@/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";

const CATEGORY_ICONS: Record<string, string> = {
  Loyer: "home",
  Salaires: "group",
  Transport: "local_shipping",
  Marketing: "campaign",
  Internet: "wifi",
  "Électricité": "bolt",
  Eau: "water_drop",
  Maintenance: "build",
  Achats: "shopping_bag",
  Fournisseurs: "store",
  Taxes: "receipt_long",
  Autres: "more_horiz",
};

interface ExpenseCategoryManagerProps {
  categories: ExpenseCategoryRecord[];
  isLoading: boolean;
  onCreate: (name: string) => Promise<boolean>;
  onUpdate: (id: number, name: string, isArchived?: boolean) => Promise<boolean>;
  onArchive: (id: number, archive: boolean) => Promise<boolean>;
  onDelete?: (id: number) => Promise<boolean>;
}

export function ExpenseCategoryManager({
  categories,
  isLoading,
  onCreate,
  onUpdate,
  onArchive,
  onDelete,
}: ExpenseCategoryManagerProps) {
  const { t } = useTranslation();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const grouped = useMemo(() => {
    const active = categories.filter((c) => !c.isArchived);
    const archived = categories.filter((c) => c.isArchived);
    return { active, archived };
  }, [categories]);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    const success = await onCreate(name);
    if (success) {
      setNewName("");
      setIsAdding(false);
    }
  };

  const handleSave = async (id: number) => {
    const name = editingName.trim();
    if (!name) return;
    const success = await onUpdate(id, name);
    if (success) {
      setEditingId(null);
      setEditingName("");
    }
  };

  const handleDelete = async (id: number) => {
    if (!onDelete) return;
    if (window.confirm(t("expenses.categories.confirm_delete", "Êtes-vous sûr de vouloir supprimer cette catégorie ?"))) {
      await onDelete(id);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header section with add button */}
      <div 
        className="glass-card" 
        style={{ 
          padding: 32, 
          borderRadius: "var(--radius-2xl)", 
          position: "relative", 
          overflow: "hidden" 
        }}
      >
        {/* Background decorative elements */}
        <div 
          style={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)",
            opacity: 0.08,
            zIndex: 0
          }}
        />
        
        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
              <div style={{ width: 56, height: 56, borderRadius: "var(--radius-xl)", background: "rgba(212,175,55,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="material-symbols-outlined filled" style={{ fontSize: 28, color: "var(--color-primary)" }}>category</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "var(--color-on-surface)", letterSpacing: "-0.01em", margin: 0 }}>
                  {t("expenses.categories.manager_title")}
                </h2>
                <span style={{ 
                  display: "inline-flex", 
                  alignItems: "center", 
                  gap: 6,
                  fontSize: 13, 
                  fontWeight: 600, 
                  color: "var(--color-primary)",
                  background: "rgba(212,175,55,0.1)",
                  padding: "4px 12px",
                  borderRadius: "var(--radius-full)",
                  width: "fit-content"
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>format_list_bulleted</span>
                  {t(categories.length === 1 ? "expenses.categories.count" : "expenses.categories.count_plural", { count: categories.length })}
                </span>
              </div>
            </div>
          </div>
          
          <Button 
            variant={isAdding ? "outline" : "primary"} 
            onClick={() => setIsAdding(!isAdding)}
            style={{ height: 48, padding: "0 24px", borderRadius: "var(--radius-full)", gap: 8, fontSize: 15, fontWeight: 600 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              {isAdding ? "close" : "add"}
            </span>
            {isAdding ? t("common.buttons.cancel") : t("expenses.categories.add_btn")}
          </Button>
        </div>

        {isAdding && (
          <div 
            style={{ 
              marginTop: 32, 
              paddingTop: 32, 
              borderTop: "1px solid rgba(208,197,175,0.2)",
              display: "flex", 
              alignItems: "flex-end", 
              gap: 16,
              flexWrap: "wrap",
              animation: "fadeIn 0.3s ease-out"
            }}
          >
            <div style={{ flex: "1 1 300px" }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-secondary)", marginBottom: 10, letterSpacing: "0.02em" }}>
                {t("expenses.categories.placeholder")}
              </label>
              <Input
                autoFocus
                placeholder={t("expenses.categories.placeholder")}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                style={{ height: 52, fontSize: 16 }}
              />
            </div>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={!newName.trim()}
              style={{ height: 52, padding: "0 40px", fontSize: 16, borderRadius: "var(--radius-lg)" }}
            >
              {t("common.buttons.save")}
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 128, borderRadius: "var(--radius-xl)" }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {/* Active Categories */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
            {grouped.active.map((cat) => {
              const iconName = CATEGORY_ICONS[cat.name] ?? "label";
              return (
                <div
                  key={cat.id}
                  className="glass-card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                    padding: 24,
                    borderRadius: "var(--radius-2xl)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    border: "1px solid rgba(208,197,175,0.3)",
                    background: "rgba(255,255,255,0.5)",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-primary-container)";
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(208,197,175,0.3)";
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ 
                    position: "absolute", top: 0, left: 0, width: "100%", height: 4, 
                    background: "linear-gradient(90deg, var(--color-primary) 0%, transparent 100%)",
                    opacity: 0.3
                  }} />
                  
                  {editingId === cat.id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
                      <Input
                        autoFocus
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSave(cat.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                      <div style={{ display: "flex", gap: 12, marginTop: "auto" }}>
                        <Button variant="success" style={{ flex: 1, height: 44 }} onClick={() => handleSave(cat.id)}>
                          <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6 }}>check</span>
                          {t("common.buttons.save")}
                        </Button>
                        <Button variant="ghost" style={{ flex: 1, height: 44 }} onClick={() => setEditingId(null)}>
                          {t("common.buttons.cancel")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                        <div style={{ 
                          width: 52, 
                          height: 52, 
                          borderRadius: "var(--radius-xl)", 
                          background: "var(--color-surface-container-low)", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          border: "1px solid var(--color-border)",
                          boxShadow: "inset 0 2px 4px rgba(255,255,255,0.5)"
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 24, color: "var(--color-primary)" }}>
                            {iconName}
                          </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
                          <h4 style={{ fontSize: 17, fontWeight: 700, color: "var(--color-on-surface)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {cat.name}
                          </h4>
                          <span style={{ 
                            display: "inline-flex", 
                            alignItems: "center", 
                            gap: 4, 
                            fontSize: 12, 
                            fontWeight: 600, 
                            color: "var(--color-tertiary)",
                            background: "rgba(39,104,104,0.1)",
                            padding: "2px 8px",
                            borderRadius: "var(--radius-full)",
                            marginTop: 8
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-tertiary)" }} />
                            Actif
                          </span>
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", gap: 8, marginTop: "auto", borderTop: "1px dashed rgba(208,197,175,0.4)", paddingTop: 20 }}>
                        <Button
                          variant="ghost"
                          style={{ flex: 1, height: 40, fontSize: 13, fontWeight: 600, gap: 6, color: "var(--color-secondary)", background: "var(--color-surface-container-low)", padding: "0 8px" }}
                          onClick={() => {
                            setEditingId(cat.id);
                            setEditingName(cat.name);
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                          <span className="hidden sm:inline">{t("expenses.categories.edit")}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          style={{ flex: 1, height: 40, fontSize: 13, fontWeight: 600, gap: 6, color: "var(--color-secondary)", background: "var(--color-surface-container-low)", padding: "0 8px" }}
                          onClick={() => onArchive(cat.id, true)}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>inventory_2</span>
                          <span className="hidden sm:inline">{t("expenses.categories.archive")}</span>
                        </Button>
                        {onDelete && (
                          <Button
                            variant="ghost"
                            style={{ flex: 1, height: 40, fontSize: 13, fontWeight: 600, gap: 6, color: "var(--color-error)", background: "rgba(186,26,26,0.04)", padding: "0 8px" }}
                            onClick={() => handleDelete(cat.id)}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                            <span className="hidden sm:inline">{t("common.buttons.delete", "Supprimer")}</span>
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Archived Categories */}
          {grouped.archived.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ flex: 1, height: 1, background: "rgba(208,197,175,0.3)" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                  {t("expenses.categories.archived")}
                </span>
                <span style={{ flex: 1, height: 1, background: "rgba(208,197,175,0.3)" }} />
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
                {grouped.archived.map((cat) => {
                  const iconName = CATEGORY_ICONS[cat.name] ?? "label";
                  return (
                    <div
                      key={cat.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        background: "rgba(208, 197, 175, 0.08)",
                        border: "1px dashed rgba(208,197,175,0.4)",
                        borderRadius: "var(--radius-xl)",
                        padding: 16,
                        opacity: 0.85,
                        transition: "opacity 0.2s ease"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = "0.85"}
                    >
                      <div style={{ 
                        width: 44, 
                        height: 44, 
                        borderRadius: "var(--radius-lg)", 
                        background: "rgba(255,255,255,0.5)", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center"
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--color-text-muted)" }}>
                          {iconName}
                        </span>
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-muted)", textDecoration: "line-through", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {cat.name}
                        </h4>
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <Button
                          variant="outline"
                          style={{ height: 36, fontSize: 13, fontWeight: 600, padding: "0 16px", gap: 6, borderRadius: "var(--radius-lg)" }}
                          onClick={() => onArchive(cat.id, false)}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>unarchive</span>
                          {t("expenses.categories.reactivate")}
                        </Button>
                        {onDelete && (
                          <Button
                            variant="danger"
                            style={{ height: 36, width: 36, padding: 0, borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center" }}
                            onClick={() => handleDelete(cat.id)}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

