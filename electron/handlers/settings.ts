import { IpcMain } from "electron";
import { prisma } from "../db/client";

async function requireAdmin(userId?: number) {
  if (!userId) throw new Error("Accès refusé: non authentifié");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "admin") {
    throw new Error("Accès refusé: privilèges administrateur requis");
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
      return prisma.$transaction(
        Object.entries(params.updates).map(([key, value]) =>
          prisma.setting.upsert({
            where: { key },
            update: { value },
            create: { key, value },
          })
        )
      );
    }
  );
}