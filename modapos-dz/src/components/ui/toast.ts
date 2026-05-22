/**
 * Typed toast helper — wraps Sonner with project-wide defaults.
 * Import this instead of importing `toast` from "sonner" directly.
 *
 * Usage:
 *   import { toastSuccess, toastError } from "@/components/ui/toast";
 *   toastSuccess("Paramètres enregistrés");
 *   toastError("Erreur lors de la sauvegarde");
 */

import { toast } from "sonner";

const SHORT = 3000;
const DEFAULT = 4500;
const LONG = 7000;

// ─── Success ───────────────────────────────────────────────────────────────
export function toastSuccess(message: string, description?: string) {
  toast.success(message, { description, duration: SHORT });
}

// ─── Error ─────────────────────────────────────────────────────────────────
export function toastError(message: string, description?: string) {
  toast.error(message, { description, duration: LONG });
}

// ─── Warning ───────────────────────────────────────────────────────────────
export function toastWarning(message: string, description?: string) {
  toast.warning(message, { description, duration: DEFAULT });
}

// ─── Info ──────────────────────────────────────────────────────────────────
export function toastInfo(message: string, description?: string) {
  toast.info(message, { description, duration: DEFAULT });
}

// ─── Loading (returns toast id so caller can dismiss it) ───────────────────
export function toastLoading(message: string): string | number {
  return toast.loading(message);
}

export function toastDismiss(id: string | number) {
  toast.dismiss(id);
}

// ─── Promise helper ────────────────────────────────────────────────────────
export function toastPromise<T>(
  promise: Promise<T>,
  messages: { loading: string; success: string; error: string }
): Promise<T> {
  return toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
  }) as unknown as Promise<T>;
}
