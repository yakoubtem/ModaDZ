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
      select: { id: true, name: true, role: true, createdAt: true },
    });
  });

  ipcMain.handle("users:verifyPin", async (_e, pin: string) => {
    const user = await prisma.user.findFirst({
      where: { pin, isActive: true },
      select: { id: true, name: true, role: true },
    });
    return user ?? null;
  });

  ipcMain.handle("users:create", async (_e, params: { currentUserId?: number; data: any }) => {
    await requireAdmin(params.currentUserId);
    return prisma.user.create({
      data: params.data,
      select: { id: true, name: true, role: true, createdAt: true },
    });
  });

  ipcMain.handle("users:update", async (_e, params: { currentUserId?: number; id: number; data: any }) => {
    await requireAdmin(params.currentUserId);
    return prisma.user.update({
      where: { id: params.id },
      data: params.data,
      select: { id: true, name: true, role: true },
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
