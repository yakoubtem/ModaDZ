import { IpcMain } from "electron";
import { prisma } from "../db/client";

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

  ipcMain.handle("users:create", async (_e, data) => {
    return prisma.user.create({
      data,
      select: { id: true, name: true, role: true, createdAt: true },
    });
  });

  ipcMain.handle("users:update", async (_e, id: number, data) => {
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, role: true },
    });
  });

  ipcMain.handle("users:delete", async (_e, id: number) => {
    return prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  });
}
