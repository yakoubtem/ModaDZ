import { useMemo, useState } from "react";
import type { ExpenseCategoryRecord } from "@/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface ExpenseCategoryManagerProps {
  categories: ExpenseCategoryRecord[];
  isLoading: boolean;
  onCreate: (name: string) => Promise<boolean>;
  onUpdate: (id: number, name: string, isArchived?: boolean) => Promise<boolean>;
  onArchive: (id: number, archive: boolean) => Promise<boolean>;
}

export function ExpenseCategoryManager({
  categories,
  isLoading,
  onCreate,
  onUpdate,
  onArchive,
}: ExpenseCategoryManagerProps) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const grouped = useMemo(() => {
    const active = categories.filter((c) => !c.isArchived);
    const archived = categories.filter((c) => c.isArchived);
    return { active, archived };
  }, [categories]);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    const success = await onCreate(name);
    if (success) setNewName("");
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

  return (
    <div className="glass-card rounded-[var(--radius-xl)] p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[var(--text-label-md)] font-[var(--fw-label-md)] tracking-[var(--ls-label-md)] text-[var(--color-secondary)]">
          Catégories de dépenses
        </h3>
        <span className="text-xs text-[var(--color-text-muted)] font-semibold">{categories.length} catégories</span>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Input
            placeholder="Ex: Loyer, Salaires, Marketing..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
        </div>
        <Button
          variant="primary"
          onClick={handleCreate}
          disabled={!newName.trim()}
          style={{ height: 44, minWidth: 100 }}
        >
          Ajouter
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-12 rounded-[var(--radius-md)]" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {grouped.active.map((cat) => (
              <div
                key={cat.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "var(--color-surface-container-low)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "14px 20px",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-outline)";
                  e.currentTarget.style.background = "var(--color-surface-container)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-border)";
                  e.currentTarget.style.background = "var(--color-surface-container-low)";
                }}
              >
                {editingId === cat.id ? (
                  <div style={{ display: "flex", flex: 1, gap: 12, alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <Input
                        autoFocus
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSave(cat.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                    </div>
                    <Button variant="success" style={{ height: 44 }} onClick={() => handleSave(cat.id)}>
                      Enregistrer
                    </Button>
                    <Button variant="ghost" style={{ height: 44 }} onClick={() => setEditingId(null)}>
                      Annuler
                    </Button>
                  </div>
                ) : (
                  <>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)", flex: 1 }}>
                      {cat.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingId(cat.id);
                        setEditingName(cat.name);
                      }}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onArchive(cat.id, true)}
                    >
                      Archiver
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>

          {grouped.archived.length > 0 && (
            <div className="pt-4 border-t border-[var(--color-border)]">
              <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
                Archivées
              </p>
              <div className="space-y-3">
                {grouped.archived.map((cat) => (
                  <div
                    key={cat.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      background: "rgba(208, 197, 175, 0.1)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-lg)",
                      padding: "14px 20px",
                    }}
                  >
                    <span style={{ fontSize: 14, color: "var(--color-outline)", textDecoration: "line-through", flex: 1 }}>
                      {cat.name}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onArchive(cat.id, false)}
                    >
                      Réactiver
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
