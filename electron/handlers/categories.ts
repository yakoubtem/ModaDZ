import { IpcMain } from "electron";
import { prisma } from "../db/client";

export function registerCategoryHandlers(ipcMain: IpcMain) {
  ipcMain.handle("categories:getAll", async () => {
    return prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
  });

  ipcMain.handle("categories:create", async (_e, data: { name: string }) => {
    return prisma.category.create({ data });
  });

  ipcMain.handle(
    "categories:update",
    async (_e, id: number, data: { name: string }) => {
      return prisma.category.update({ where: { id }, data });
    }
  );

  ipcMain.handle("categories:delete", async (_e, id: number) => {
    return prisma.category.delete({ where: { id } });
  });
}
