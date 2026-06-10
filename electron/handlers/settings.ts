import { IpcMain } from "electron";
import { prisma } from "../db/client";
import { logActivity } from "./activityLogs";

import { getCurrentUserId } from "../helpers/rbac";

async function requireAdmin(userId?: number) {
  const finalUserId = userId !== undefined ? userId : getCurrentUserId();
  if (!finalUserId) throw new Error("Permission denied");
  const user = await prisma.user.findUnique({ where: { id: finalUserId } });
  if (!user || user.role !== "admin" || !user.isActive) {
    throw new Error("Permission denied");
  }
}

export function registerSettingsHandlers(ipcMain: IpcMain) {
  ipcMain.handle("settings:getAll", async () => {
    const raw = await prisma.setting.findMany();
    const settings: Record<string, string> = {};
    for (const r of raw) {
      settings[r.key] = r.value;
    }
    return settings;
  });

  ipcMain.handle(
    "settings:updateMany",
    async (_e, params: { currentUserId?: number; updates: Record<string, string> }) => {
      const keys = Object.keys(params.updates);
      const isOnlyLanguage = keys.length === 1 && keys[0] === "language";
      if (!isOnlyLanguage) {
        await requireAdmin(params.currentUserId);
      }
      // Upsert all keys
      const result = await prisma.$transaction(
        Object.entries(params.updates).map(([key, value]) =>
          prisma.setting.upsert({
            where: { key },
            update: { value },
            create: { key, value },
          })
        )
      );

      const updatedKeys = keys.join(", ");
      await logActivity(
        prisma,
        params.currentUserId,
        "UPDATE",
        "Settings",
        "system",
        `Modification des paramètres : [${updatedKeys}]`
      );

      return result;
    }
  );
}