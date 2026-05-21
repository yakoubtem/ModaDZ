import { IpcMain } from "electron";
import { prisma } from "../db/client";

export function registerSaleHandlers(ipcMain: IpcMain) {
  ipcMain.handle("sales:getAll", async (_e, filters?: { from?: string; to?: string; status?: string }) => {
    return prisma.sale.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.from || filters?.to
          ? {
              createdAt: {
                ...(filters.from && { gte: new Date(filters.from) }),
                ...(filters.to && { lte: new Date(filters.to) }),
              },
            }
          : {}),
      },
      include: {
        user: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true, phone: true } },
        items: {
          include: {
            variant: {
              include: { product: { select: { id: true, name: true, sku: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  });

  ipcMain.handle("sales:getById", async (_e, id: number) => {
    return prisma.sale.findUnique({
      where: { id },
      include: {
        user: true,
        customer: true,
        items: {
          include: {
            variant: { include: { product: true } },
          },
        },
      },
    });
  });

  ipcMain.handle("sales:create", async (_e, data) => {
    const { items, ...saleData } = data;

    return prisma.$transaction(async (tx) => {
      // Deduct stock for each item
      for (const item of items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return tx.sale.create({
        data: {
          ...saleData,
          items: {
            create: items,
          },
        },
        include: {
          items: { include: { variant: { include: { product: true } } } },
          customer: true,
          user: true,
        },
      });
    });
  });

  ipcMain.handle("sales:refund", async (_e, id: number) => {
    return prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!sale) throw new Error("Sale not found");
      if (sale.status === "refunded") throw new Error("Sale already refunded");

      // Restore stock
      for (const item of sale.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return tx.sale.update({
        where: { id },
        data: { status: "refunded" },
      });
    });
  });

  ipcMain.handle("sales:getRecent", async (_e, limit = 10) => {
    return prisma.sale.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true } },
        items: true,
      },
    });
  });
}
