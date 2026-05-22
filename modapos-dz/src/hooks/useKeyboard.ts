import { useEffect } from "react";

type KeyCombo = string; // e.g. "ctrl+k", "Escape", "F9"

interface ShortcutMap {
  [key: KeyCombo]: (e: KeyboardEvent) => void;
}

/**
 * Registers keyboard shortcuts and cleans them up on unmount.
 * Each handler receives the full KeyboardEvent and is responsible
 * for calling e.preventDefault() if needed.
 * Keys: "F1", "F9", "Escape", "ctrl+k", "shift+enter", etc.
 */
export function useKeyboard(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const parts: string[] = [];
      if (e.ctrlKey) parts.push("ctrl");
      if (e.shiftKey) parts.push("shift");
      if (e.altKey) parts.push("alt");
      parts.push(e.key);

      const combo = parts.join("+");
      // Match exact key (case-sensitive for F-keys like "F1", "F9")
      const cb = shortcuts[combo] ?? shortcuts[e.key];
      if (cb) cb(e);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts]);
}
