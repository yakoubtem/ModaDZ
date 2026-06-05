import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Tag,
  Check,
  X,
} from "lucide-react";

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
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;

    setIsSubmitting(true);

    const ok = await onCreate(newName.trim());

    if (ok) {
      setNewName("");
    }

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

    if (ok) {
      setDeleteConfirmId(null);
    }

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
      description="Organisez vos produits avec des catégories claires et structurées."
      size="md"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {/* CREATE SECTION */}
        <div style={{ borderRadius: 16, border: "1px solid rgba(208,197,175,0.3)", background: "rgba(245,243,238,0.5)", padding: 24 }}>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-neutral-900">
              Nouvelle catégorie
            </h3>

            <p className="mt-1 text-[13px] text-neutral-500">
              Ajoutez une nouvelle catégorie pour organiser votre catalogue.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Input
              placeholder="Ex: Sneakers, Accessoires, Vestes..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && handleCreate()
              }
              className="flex-1"
            />

            <Button
              variant="primary"
              size="md"
              onClick={handleCreate}
              disabled={!newName.trim()}
              isLoading={isSubmitting && editingId === null}
              className="min-w-[110px]"
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </Button>
          </div>
        </div>

        {/* LIST */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">
                Catégories existantes
              </h3>

              <p className="mt-1 text-[13px] text-neutral-500">
                {categories.length} catégorie
                {categories.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 py-14">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
                <Tag className="h-6 w-6 text-neutral-500" />
              </div>

              <p className="text-sm font-medium text-neutral-700">
                Aucune catégorie
              </p>

              <p className="mt-1 text-[13px] text-neutral-500">
                Commencez par créer votre première catégorie.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 420, overflowY: "auto", paddingRight: 4 }}>
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={cn(
                    "group rounded-2xl border border-neutral-200 bg-white px-4 py-4",
                    "transition-all duration-200",
                    "hover:border-neutral-300 hover:shadow-sm"
                  )}
                >
                  {editingId === cat.id ? (
                    <div className="space-y-4">
                      <Input
                        autoFocus
                        value={editingName}
                        onChange={(e) =>
                          setEditingName(e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdate();

                          if (e.key === "Escape") {
                            setEditingId(null);
                          }
                        }}
                      />

                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="h-4 w-4" />
                          Annuler
                        </Button>

                        <Button
                          size="sm"
                          variant="primary"
                          onClick={handleUpdate}
                          isLoading={isSubmitting}
                        >
                          <Check className="h-4 w-4" />
                          Enregistrer
                        </Button>
                      </div>
                    </div>
                  ) : deleteConfirmId === cat.id ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-red-600">
                          Supprimer cette catégorie ?
                        </p>

                        <p className="mt-1 text-[13px] text-neutral-500">
                          Cette action est irréversible.
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setDeleteConfirmId(null)
                          }
                        >
                          Annuler
                        </Button>

                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(cat.id)}
                          isLoading={isSubmitting}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-neutral-900">
                          {cat.name}
                        </p>

                        <div className="mt-2">
                          <Badge variant="default">
                            {cat._count?.products || 0} produit
                            {(cat._count?.products || 0) !== 1
                              ? "s"
                              : ""}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <button
                          onClick={() => startEdit(cat)}
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-xl",
                            "border border-neutral-200 bg-white",
                            "text-neutral-500 transition-all",
                            "hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900"
                          )}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() =>
                            setDeleteConfirmId(cat.id)
                          }
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-xl",
                            "border border-neutral-200 bg-white",
                            "text-neutral-500 transition-all",
                            "hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          )}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}