import { useEffect } from "react";

type KeyCombo = string; // e.g. "ctrl+k", "escape", "F2"

interface ShortcutMap {
  [key: KeyCombo]: (e: KeyboardEvent) => void;
}

/**
 * Registers keyboard shortcuts and cleans them up on unmount.
 * Key combos: "ctrl+k", "shift+enter", "escape", "F2", etc.
 */
export function useKeyboard(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const parts: string[] = [];
      if (e.ctrlKey) parts.push("ctrl");
      if (e.shiftKey) parts.push("shift");
      if (e.altKey) parts.push("alt");
      parts.push(e.key.toLowerCase());

      const combo = parts.join("+");
      const cb = shortcuts[combo] ?? shortcuts[e.key] ?? shortcuts[e.key.toLowerCase()];
      if (cb) {
        e.preventDefault();
        cb(e);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts]);
}
