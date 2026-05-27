import { useState } from "react";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onCreate: (name: string) => Promise<boolean>;
  onUpdate: (id: number, name: string) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
}

export function CategoryManager({
  isOpen,
  onClose,
  categories,
  onCreate,
  onUpdate,
  onDelete,
}: CategoryManagerProps) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setIsSubmitting(true);
    const ok = await onCreate(newName.trim());
    if (ok) setNewName("");
    setIsSubmitting(false);
  };

  const handleUpdate = async () => {
    if (!editingName.trim() || editingId === null) return;
    setIsSubmitting(true);
    const ok = await onUpdate(editingId, editingName.trim());
    if (ok) {
      setEditingId(null);
      setEditingName("");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    setIsSubmitting(true);
    const ok = await onDelete(id);
    if (ok) setDeleteConfirmId(null);
    setIsSubmitting(false);
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
    setDeleteConfirmId(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestion des catégories"
      description="Créez et gérez les catégories de vos produits."
      size="sm"
    >
      {/* Create new */}
      <div className="flex gap-2 mb-5">
        <Input
          placeholder="Nom de la catégorie..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          className="flex-1"
        />
        <Button
          variant="primary"
          size="md"
          onClick={handleCreate}
          isLoading={isSubmitting && !editingId}
          disabled={!newName.trim()}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Category list */}
      <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-[var(--color-text-muted)]">
            <Tag className="w-8 h-8" />
            <p className="text-sm">Aucune catégorie créée</p>
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className={cn(
                "group flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-md)]",
                "bg-[var(--color-bg-elevated)] border border-[var(--color-border)]",
                "transition-colors hover:border-[var(--color-border-strong)]"
              )}
            >
              {editingId === cat.id ? (
                // Edit mode
                <>
                  <input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdate();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] focus:outline-none"
                  />
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleUpdate}
                    isLoading={isSubmitting}
                  >
                    Valider
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingId(null)}
                  >
                    ✕
                  </Button>
                </>
              ) : deleteConfirmId === cat.id ? (
                // Delete confirm
                <>
                  <p className="flex-1 text-xs text-[var(--color-danger)]">
                    Supprimer "{cat.name}" ?
                  </p>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(cat.id)}
                    isLoading={isSubmitting}
                  >
                    Oui
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteConfirmId(null)}
                  >
                    Non
                  </Button>
                </>
              ) : (
                // Display mode
                <>
                  <span className="flex-1 text-sm text-[var(--color-text-primary)]">
                    {cat.name}
                  </span>
                  {cat._count && (
                    <Badge variant="default">
                      {cat._count.products} produit{cat._count.products !== 1 ? "s" : ""}
                    </Badge>
                  )}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(cat)}
                      className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-overlay)] transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(cat.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}
