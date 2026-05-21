import { useCallback } from "react";

/**
 * Type-safe hook that wraps window.api.invoke.
 * Usage: const api = useIPC(); api('products:getAll')
 */
export function useIPC() {
  const invoke = useCallback(
    async <T = unknown>(channel: string, ...args: unknown[]): Promise<T> => {
      return window.api.invoke(channel, ...args) as Promise<T>;
    },
    []
  );

  return invoke;
}
