import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useIPC } from "@/hooks/useIPC";
import type { Category } from "@/types";

export function useCategories() {
  const api = useIPC();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await api<Category[]>("categories:getAll");
      setCategories(result);
    } catch {
      toast.error("Erreur lors du chargement des catégories");
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  const create = useCallback(
    async (name: string): Promise<boolean> => {
      try {
        await api("categories:create", { name });
        toast.success(`Catégorie "${name}" créée`);
        await load();
        return true;
      } catch {
        toast.error("Cette catégorie existe déjà");
        return false;
      }
    },
    [api, load]
  );

  const update = useCallback(
    async (id: number, name: string): Promise<boolean> => {
      try {
        await api("categories:update", id, { name });
        toast.success("Catégorie mise à jour");
        await load();
        return true;
      } catch {
        toast.error("Erreur lors de la mise à jour");
        return false;
      }
    },
    [api, load]
  );

  const remove = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await api("categories:delete", id);
        toast.success("Catégorie supprimée");
        await load();
        return true;
      } catch {
        toast.error("Impossible de supprimer cette catégorie (produits existants)");
        return false;
      }
    },
    [api, load]
  );

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { categories, isLoading, load, create, update, remove };
}
