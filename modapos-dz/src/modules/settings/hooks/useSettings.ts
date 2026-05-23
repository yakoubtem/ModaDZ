import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/modules/auth/AuthContext";
import { useIPC } from "@/hooks/useIPC";
import type { AppSettings } from "@/types";

export function useSettings() {
  const { user } = useAuth();
  const invoke = useIPC();
  const [settings, setSettings] = useState<Partial<AppSettings>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await invoke("settings:getAll") as Partial<AppSettings>;
      setSettings(res || {});
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [invoke]);

  const updateSettings = useCallback(async (updates: Record<string, string>) => {
    if (!user?.id) return false;
    try {
      await invoke("settings:updateMany", { currentUserId: user.id, updates });
      setSettings((prev) => ({ ...prev, ...updates }));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }, [invoke, user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    isLoading,
    updateSettings,
    refresh: fetchSettings,
  };
}