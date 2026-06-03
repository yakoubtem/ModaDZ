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
    <div className="glass-card rounded-[var(--radius-xl)] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[var(--text-label-md)] font-[var(--fw-label-md)] tracking-[var(--ls-label-md)] text-[var(--color-secondary)]">
          Categories de depenses
        </h3>
        <span className="text-xs text-[var(--color-text-muted)]">{categories.length}</span>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Ajouter une categorie"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <Button variant="primary" size="sm" onClick={handleCreate} disabled={!newName.trim()}>
          Ajouter
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-10 rounded-[var(--radius-md)]" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            {grouped.active.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2 bg-[var(--color-bg-elevated)] rounded-[var(--radius-lg)] px-3 py-2">
                {editingId === cat.id ? (
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1"
                  />
                ) : (
                  <span className="text-sm font-semibold text-[var(--color-on-surface)] flex-1">
                    {cat.name}
                  </span>
                )}
                {editingId === cat.id ? (
                  <Button variant="success" size="sm" onClick={() => handleSave(cat.id)}>
                    Enregistrer
                  </Button>
                ) : (
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
                )}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onArchive(cat.id, true)}
                >
                  Archiver
                </Button>
              </div>
            ))}
          </div>

          {grouped.archived.length > 0 && (
            <div className="pt-2 border-t border-[var(--color-border)]">
              <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
                Archivees
              </p>
              <div className="space-y-2">
                {grouped.archived.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-2 bg-[var(--color-bg-elevated)] rounded-[var(--radius-lg)] px-3 py-2">
                    <span className="text-sm text-[var(--color-text-secondary)] flex-1">
                      {cat.name}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onArchive(cat.id, false)}
                    >
                      Reactiver
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
