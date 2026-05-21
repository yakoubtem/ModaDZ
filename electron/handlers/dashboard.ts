import { IpcMain } from "electron";
import { prisma } from "../db/client";

export function registerDashboardHandlers(ipcMain: IpcMain) {
  ipcMain.handle("dashboard:getStats", async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      todaySales,
      monthSales,
      totalProducts,
      lowStockCount,
      totalCustomers,
      recentSales,
    ] = await Promise.all([
      prisma.sale.aggregate({
        where: {
          status: "completed",
          createdAt: { gte: today, lt: tomorrow },
        },
        _sum: { total: true },
        _count: { id: true },
      }),
      prisma.sale.aggregate({
        where: {
          status: "completed",
          createdAt: { gte: startOfMonth },
        },
        _sum: { total: true },
        _count: { id: true },
      }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.productVariant.count({ where: { stock: { lte: 5 } } }),
      prisma.customer.count(),
      prisma.sale.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        where: { status: "completed" },
        include: {
          customer: { select: { name: true } },
          items: { select: { quantity: true } },
        },
      }),
    ]);

    return {
      todayRevenue: todaySales._sum.total ?? 0,
      todaySalesCount: todaySales._count.id,
      monthRevenue: monthSales._sum.total ?? 0,
      monthSalesCount: monthSales._count.id,
      totalProducts,
      lowStockCount,
      totalCustomers,
      recentSales,
    };
  });

  ipcMain.handle("dashboard:getRevenueChart", async (_e, days = 30) => {
    const from = new Date();
    from.setDate(from.getDate() - days);
    from.setHours(0, 0, 0, 0);

    const sales = await prisma.sale.findMany({
      where: {
        status: "completed",
        createdAt: { gte: from },
      },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    // Group by date
    const map = new Map<string, number>();
    sales.forEach((s) => {
      const key = s.createdAt.toISOString().split("T")[0];
      map.set(key, (map.get(key) ?? 0) + s.total);
    });

    return Array.from(map.entries()).map(([date, revenue]) => ({ date, revenue }));
  });
}
