import { IpcMain } from "electron";
import { prisma } from "../db/client";

// Helper for IPC protection
async function requireAdmin(userId?: number) {
  if (!userId) throw new Error("Accès refusé: non authentifié");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "admin") {
    throw new Error("Accès refusé: privilèges administrateur requis");
  }
}

export function registerUserHandlers(ipcMain: IpcMain) {
  ipcMain.handle("users:getAll", async () => {
    return prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true, username: true, role: true, createdAt: true },
    });
  });

  ipcMain.handle("users:verifyCredentials", async (_e, credentials: { username?: string, password?: string } | undefined) => {
    try {
      if (!credentials || !credentials.username || !credentials.password) {
        throw new Error("Missing credentials");
      }
      const { username, password } = credentials;
      const user = await prisma.user.findFirst({
        where: { username, password, isActive: true },
        select: { id: true, name: true, username: true, role: true },
      });
      return user ?? null;
    } catch (error) {
      console.error("verifyCredentials error:", error);
      throw error;
    }
  });

  ipcMain.handle("users:create", async (_e, params: { currentUserId?: number; data: any }) => {
    await requireAdmin(params.currentUserId);
    return prisma.user.create({
      data: params.data,
      select: { id: true, name: true, username: true, role: true, createdAt: true },
    });
  });

  ipcMain.handle("users:update", async (_e, params: { currentUserId?: number; id: number; data: any }) => {
    await requireAdmin(params.currentUserId);
    return prisma.user.update({
      where: { id: params.id },
      data: params.data,
      select: { id: true, name: true, username: true, role: true },
    });
  });

  ipcMain.handle("users:delete", async (_e, params: { currentUserId?: number; id: number }) => {
    await requireAdmin(params.currentUserId);
    return prisma.user.update({
      where: { id: params.id },
      data: { isActive: false },
    });
  });
}
