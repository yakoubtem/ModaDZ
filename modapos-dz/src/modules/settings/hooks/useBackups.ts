import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/modules/auth/AuthContext";
import { useIPC } from "@/hooks/useIPC";
import type { BackupItem } from "@/types";

export function useBackups() {
  const { user } = useAuth();
  const { invoke } = useIPC();
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBackups = useCallback(async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const res = await invoke("backups:getAll", { currentUserId: user.id }) as BackupItem[];
      setBackups(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [invoke, user]);

  const createBackup = useCallback(async () => {
    if (!user?.id) return false;
    try {
      await invoke("backups:create", { currentUserId: user.id });
      await fetchBackups();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }, [invoke, user, fetchBackups]);

  const restoreBackup = useCallback(async (id: number) => {
    if (!user?.id) return false;
    try {
      await invoke("backups:restore", { currentUserId: user.id, id });
      // In a real app we might want to tell the user the app needs to restart
      alert("Sauvegarde restaurée avec succès. Veuillez relancer l'application pour appliquer les changements.");
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }, [invoke, user]);

  const exportBackup = useCallback(async (id: number) => {
    if (!user?.id) return false;
    try {
      const res = await invoke("backups:exportZip", { currentUserId: user.id, id });
      if (res) alert("Export réussi !");
      return !!res;
    } catch (err: any) {
      alert("Erreur lors de l'export: " + err.message);
      return false;
    }
  }, [invoke, user]);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  return {
    backups,
    isLoading,
    createBackup,
    restoreBackup,
    exportBackup,
    refresh: fetchBackups,
  };
}