import { IpcMain } from "electron";
import { prisma } from "../db/client";

// ─── Helper: compute customer stats from their sales ─────
function computeStats(sales: Array<{ total: number; amountPaid: number; createdAt: Date }>) {
  const totalSpent = sales.reduce((s, x) => s + x.total, 0);
  const totalAmountPaid = sales.reduce((s, x) => s + x.amountPaid, 0);
  const debt = Math.max(0, totalSpent - totalAmountPaid);
  const lastPurchaseDate =
    sales.length > 0 ? sales[0].createdAt.toISOString() : undefined;
  return { totalOrders: sales.length, totalSpent, totalAmountPaid, debt, lastPurchaseDate };
}

export function registerCustomerHandlers(ipcMain: IpcMain) {
  // ─── List (with stats) ───────────────────────────────────
  ipcMain.handle(
    "customers:getAll",
    async (_e, params?: { search?: string; page?: number; pageSize?: number }) => {
      const page = params?.page ?? 1;
      const pageSize = params?.pageSize ?? 20;
      const skip = (page - 1) * pageSize;
      const search = params?.search?.trim();

      const where = search
        ? {
            OR: [
              { name: { contains: search } },
              { phone: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : {};

      const [rawCustomers, total] = await Promise.all([
        prisma.customer.findMany({
          where,
          include: {
            _count: { select: { sales: true } },
            sales: {
              select: { total: true, amountPaid: true, createdAt: true },
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: pageSize,
        }),
        prisma.customer.count({ where }),
      ]);

      const customers = rawCustomers.map(({ sales, ...c }) => ({
        ...c,
        ...computeStats(sales),
      }));

      return { customers, total, page, pageSize };
    }
  );

  // ─── Get by ID (full profile + sales) ────────────────────
  ipcMain.handle("customers:getById", async (_e, id: number) => {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        sales: {
          orderBy: { createdAt: "desc" },
          include: {
            items: {
              include: {
                variant: {
                  include: {
                    product: { select: { name: true, sku: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!customer) return null;

    const stats = computeStats(
      customer.sales.map((s) => ({
        total: s.total,
        amountPaid: s.amountPaid,
        createdAt: s.createdAt,
      }))
    );

    return { ...customer, stats };
  });

  // ─── Search (fast, for checkout typeahead) ─────────────────
  ipcMain.handle("customers:search", async (_e, query: string) => {
    return prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { phone: { contains: query } },
        ],
      },
      take: 10,
      orderBy: { name: "asc" },
    });
  });

  // ─── Create ──────────────────────────────────────────────
  ipcMain.handle(
    "customers:create",
    async (_e, data: { name: string; phone?: string; email?: string; notes?: string }) => {
      return prisma.customer.create({ data });
    }
  );

  // ─── Update ──────────────────────────────────────────────
  ipcMain.handle(
    "customers:update",
    async (_e, id: number, data: { name?: string; phone?: string; email?: string; notes?: string }) => {
      return prisma.customer.update({ where: { id }, data });
    }
  );

  // ─── Delete ──────────────────────────────────────────────
  ipcMain.handle("customers:delete", async (_e, id: number) => {
    const count = await prisma.sale.count({ where: { customerId: id } });
    if (count > 0) {
      // Detach rather than block — set customerId to null on all sales
      await prisma.sale.updateMany({
        where: { customerId: id },
        data: { customerId: null },
      });
    }
    return prisma.customer.delete({ where: { id } });
  });
}
