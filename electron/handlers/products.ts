import { IpcMain } from "electron";
import { prisma } from "../db/client";

export function registerProductHandlers(ipcMain: IpcMain) {
  ipcMain.handle("products:getAll", async () => {
    return prisma.product.findMany({
      where: { isActive: true },
      include: { category: true, variants: true },
      orderBy: { createdAt: "desc" },
    });
  });

  ipcMain.handle("products:getById", async (_e, id: number) => {
    return prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: true },
    });
  });

  ipcMain.handle("products:create", async (_e, data) => {
    const { variants, ...productData } = data;
    return prisma.product.create({
      data: {
        ...productData,
        variants: {
          create: variants ?? [],
        },
      },
      include: { category: true, variants: true },
    });
  });

  ipcMain.handle("products:update", async (_e, id: number, data) => {
    const { variants, ...productData } = data;
    return prisma.product.update({
      where: { id },
      data: productData,
      include: { category: true, variants: true },
    });
  });

  ipcMain.handle("products:delete", async (_e, id: number) => {
    return prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  });

  ipcMain.handle("products:search", async (_e, query: string) => {
    return prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query } },
          { sku: { contains: query } },
        ],
      },
      include: { category: true, variants: true },
      take: 20,
    });
  });
}
