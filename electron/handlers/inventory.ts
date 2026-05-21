import { IpcMain } from "electron";
import { prisma } from "../db/client";

export function registerInventoryHandlers(ipcMain: IpcMain) {
  ipcMain.handle("inventory:getAll", async () => {
    return prisma.productVariant.findMany({
      include: {
        product: { include: { category: true } },
      },
      orderBy: { stock: "asc" },
    });
  });

  ipcMain.handle("inventory:getLowStock", async (_e, threshold = 5) => {
    return prisma.productVariant.findMany({
      where: { stock: { lte: threshold } },
      include: { product: { include: { category: true } } },
      orderBy: { stock: "asc" },
    });
  });

  ipcMain.handle(
    "inventory:adjust",
    async (_e, variantId: number, quantity: number) => {
      return prisma.productVariant.update({
        where: { id: variantId },
        data: { stock: { increment: quantity } },
        include: { product: true },
      });
    }
  );

  ipcMain.handle(
    "inventory:setStock",
    async (_e, variantId: number, stock: number) => {
      return prisma.productVariant.update({
        where: { id: variantId },
        data: { stock },
        include: { product: true },
      });
    }
  );

  ipcMain.handle("inventory:getVariantsByProduct", async (_e, productId: number) => {
    return prisma.productVariant.findMany({
      where: { productId },
      orderBy: [{ size: "asc" }, { color: "asc" }],
    });
  });
}
