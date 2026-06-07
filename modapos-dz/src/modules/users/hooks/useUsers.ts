import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/modules/auth/AuthContext";
import { useIPC } from "@/hooks/useIPC";
import type { User } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

export function useUsers() {
  const { user: currentUser } = useAuth();
  const invoke = useIPC();
  const { t } = useTranslation();
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
      alert(t("users.alerts.create_error", { message: err.message }));
      return false;
    }
  }, [invoke, currentUser, fetchUsers, t]);

  const updateUser = useCallback(async (id: number, data: any) => {
    if (!currentUser?.id) return false;
    try {
      await invoke("users:update", { currentUserId: currentUser.id, id, data });
      await fetchUsers();
      return true;
    } catch (err: any) {
      alert(t("users.alerts.update_error", { message: err.message }));
      return false;
    }
  }, [invoke, currentUser, fetchUsers, t]);

  const deleteUser = useCallback(async (id: number) => {
    if (!currentUser?.id) return false;
    if (id === currentUser.id) {
      alert(t("users.alerts.delete_self_error"));
      return false;
    }
    const yes = window.confirm(t("users.alerts.delete_confirm"));
    if (!yes) return false;

    try {
      await invoke("users:delete", { currentUserId: currentUser.id, id });
      await fetchUsers();
      return true;
    } catch (err: any) {
      alert(t("users.alerts.delete_error", { message: err.message }));
      return false;
    }
  }, [invoke, currentUser, fetchUsers, t]);

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