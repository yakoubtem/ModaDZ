import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/modules/auth/AuthContext";
import { useIPC } from "@/hooks/useIPC";
import type { User } from "@/types";

export function useUsers() {
  const { user: currentUser } = useAuth();
  const invoke = useIPC();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await invoke("users:getAll") as User[];
      setUsers(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [invoke]);

  const createUser = useCallback(async (data: any) => {
    if (!currentUser?.id) return false;
    try {
      await invoke("users:create", { currentUserId: currentUser.id, data });
      await fetchUsers();
      return true;
    } catch (err: any) {
      alert("Erreur de création: " + err.message);
      return false;
    }
  }, [invoke, currentUser, fetchUsers]);

  const updateUser = useCallback(async (id: number, data: any) => {
    if (!currentUser?.id) return false;
    try {
      await invoke("users:update", { currentUserId: currentUser.id, id, data });
      await fetchUsers();
      return true;
    } catch (err: any) {
      alert("Erreur de modification: " + err.message);
      return false;
    }
  }, [invoke, currentUser, fetchUsers]);

  const deleteUser = useCallback(async (id: number) => {
    if (!currentUser?.id) return false;
    if (id === currentUser.id) {
      alert("Vous ne pouvez pas supprimer votre propre compte.");
      return false;
    }
    const yes = window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?");
    if (!yes) return false;

    try {
      await invoke("users:delete", { currentUserId: currentUser.id, id });
      await fetchUsers();
      return true;
    } catch (err: any) {
      alert("Erreur de suppression: " + err.message);
      return false;
    }
  }, [invoke, currentUser, fetchUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    createUser,
    updateUser,
    deleteUser,
    refresh: fetchUsers,
  };
}