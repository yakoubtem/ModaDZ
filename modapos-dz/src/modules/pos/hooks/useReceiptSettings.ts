import { useState, useEffect, useCallback } from "react";
import { useIPC } from "@/hooks/useIPC";

export interface ReceiptSettings {
  storeName: string;
  storePhone: string;
  storeAddress: string;
  receiptFooter: string;
}

const DEFAULT_SETTINGS: ReceiptSettings = {
  storeName: "ModaDZ",
  storePhone: "",
  storeAddress: "",
  receiptFooter: "Merci de votre visite ! À bientôt.",
};

// Module-level cache — fetched once per app session
let cached: ReceiptSettings | null = null;

export function useReceiptSettings() {
  const api = useIPC();
  const [settings, setSettings] = useState<ReceiptSettings>(cached ?? DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(cached === null);

  const fetch = useCallback(async () => {
    if (cached) {
      setSettings(cached);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const raw = await api<Record<string, string>>("settings:getAll");
      const resolved: ReceiptSettings = {
        storeName: raw.storeName || DEFAULT_SETTINGS.storeName,
        storePhone: raw.storePhone || DEFAULT_SETTINGS.storePhone,
        storeAddress: raw.storeAddress || DEFAULT_SETTINGS.storeAddress,
        receiptFooter: raw.receiptFooter || DEFAULT_SETTINGS.receiptFooter,
      };
      cached = resolved;
      setSettings(resolved);
    } catch {
      // Silently fall back to defaults — receipt still works
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  /** Call this after updating settings so the cache is refreshed */
  const invalidate = useCallback(() => {
    cached = null;
    fetch();
  }, [fetch]);

  return { settings, isLoading, invalidate };
}
