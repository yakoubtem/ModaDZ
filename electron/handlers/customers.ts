import { IpcMain } from "electron";
import { prisma } from "../db/client";

export function registerCustomerHandlers(ipcMain: IpcMain) {
  ipcMain.handle("customers:getAll", async () => {
    return prisma.customer.findMany({
      include: { _count: { select: { sales: true } } },
      orderBy: { createdAt: "desc" },
    });
  });

  ipcMain.handle("customers:getById", async (_e, id: number) => {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        sales: {
          orderBy: { createdAt: "desc" },
          include: { items: true },
          take: 20,
        },
      },
    });
  });

  ipcMain.handle("customers:create", async (_e, data) => {
    return prisma.customer.create({ data });
  });

  ipcMain.handle("customers:update", async (_e, id: number, data) => {
    return prisma.customer.update({ where: { id }, data });
  });

  ipcMain.handle("customers:delete", async (_e, id: number) => {
    return prisma.customer.delete({ where: { id } });
  });

  ipcMain.handle("customers:search", async (_e, query: string) => {
    return prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { phone: { contains: query } },
        ],
      },
      take: 10,
    });
  });
}
