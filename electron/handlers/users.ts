import { IpcMain } from "electron";
import { prisma } from "../db/client";
import { logActivity } from "./activityLogs";
import { setCurrentUserId, getCurrentUserId } from "../helpers/rbac";

// Helper for IPC protection
async function requireAdmin(userId?: number) {
  const finalUserId = userId !== undefined ? userId : getCurrentUserId();
  if (!finalUserId) throw new Error("Permission denied");
  const user = await prisma.user.findUnique({ where: { id: finalUserId } });
  if (!user || user.role !== "admin" || !user.isActive) {
    throw new Error("Permission denied");
  }
}

export function registerUserHandlers(ipcMain: IpcMain) {
  ipcMain.handle("auth:setCurrentUser", (_e, userId: number | null) => {
    setCurrentUserId(userId);
    return true;
  });

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
    const user = await prisma.user.create({
      data: params.data,
      select: { id: true, name: true, username: true, role: true, createdAt: true },
    });
    await logActivity(
      prisma,
      params.currentUserId,
      "CREATE",
      "User",
      String(user.id),
      `Création de l'utilisateur ${user.name} (${user.username}, rôle: ${user.role})`
    );
    return user;
  });

  ipcMain.handle("users:update", async (_e, params: { currentUserId?: number; id: number; data: any }) => {
    await requireAdmin(params.currentUserId);
    const user = await prisma.user.update({
      where: { id: params.id },
      data: params.data,
      select: { id: true, name: true, username: true, role: true },
    });
    await logActivity(
      prisma,
      params.currentUserId,
      "UPDATE",
      "User",
      String(user.id),
      `Modification de l'utilisateur ${user.name} (${user.username}, rôle: ${user.role})`
    );
    return user;
  });

  ipcMain.handle("users:delete", async (_e, params: { currentUserId?: number; id: number }) => {
    await requireAdmin(params.currentUserId);
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { isActive: false },
    });
    await logActivity(
      prisma,
      params.currentUserId,
      "DELETE",
      "User",
      String(params.id),
      `Désactivation (suppression) de l'utilisateur ${user.name}`
    );
    return user;
  });
}
