import { IpcMain } from "electron";
import { prisma } from "../db/client";

export function registerDashboardHandlers(ipcMain: IpcMain) {
  ipcMain.handle("dashboard:getSummary", async (_e, params?: { days?: number }) => {
    const days = params?.days || 30;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    fromDate.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      todaySales,
      monthSales,
      totalProducts,
      lowStockVariants,
      totalCustomers,
      recentSales,
      salesPeriod,
      topVariantsQuery
    ] = await Promise.all([
      // 1. Today's stats
      prisma.sale.aggregate({
        where: { status: "completed", createdAt: { gte: today, lt: tomorrow } },
        _sum: { total: true },
        _count: { id: true },
      }),
      // 2. Month's stats
      prisma.sale.aggregate({
        where: { status: "completed", createdAt: { gte: startOfMonth } },
        _sum: { total: true },
        _count: { id: true },
      }),
      // 3. Products
      prisma.product.count({ where: { isActive: true } }),
      // 4. Low Stock Variants Feed
      prisma.productVariant.findMany({
        where: { stock: { lte: 5 } },
        include: { product: { select: { name: true } } },
        orderBy: { stock: 'asc' },
        take: 5
      }),
      // 5. Total Customers
      prisma.customer.count(),
      // 6. Recent Sales Feed
      prisma.sale.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        where: { status: "completed" },
        include: {
          customer: { select: { name: true } },
          items: { select: { quantity: true } },
        },
      }),
      // 7. Sales per period for trend chart & payment breakdown
      prisma.sale.findMany({
        where: { status: "completed", createdAt: { gte: fromDate } },
        select: { total: true, createdAt: true, paymentMethod: true },
        orderBy: { createdAt: "asc" },
      }),
      // 8. Top Products (Sales items aggregate over period)
      prisma.saleItem.groupBy({
        by: ['variantId'],
        _sum: { quantity: true, unitPrice: true },
        where: {
          sale: { status: "completed", createdAt: { gte: fromDate } }
        },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      })
    ]);

    // Format revenue chart
    const chartMap = new Map<string, number>();
    const paymentMap = new Map<string, number>();

    salesPeriod.forEach((s) => {
      // Revenue
      const dateKey = s.createdAt.toISOString().split("T")[0];
      chartMap.set(dateKey, (chartMap.get(dateKey) ?? 0) + s.total);
      
      // Payment Breakdown
      const method = s.paymentMethod || "cash";
      paymentMap.set(method, (paymentMap.get(method) ?? 0) + 1);
    });

    const revenueChart = Array.from(chartMap.entries()).map(([date, revenue]) => ({ date, revenue }));
    
    // Sort array elements by date to be certain
    revenueChart.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const paymentMethods = Array.from(paymentMap.entries()).map(([name, value]) => ({ name, value }));

    // Populate Top Products Names & Revenue — single batched query (no N+1)
    const variantIds = topVariantsQuery.map((tv) => tv.variantId);
    const [variants, saleItemsForRevenue] = await Promise.all([
      prisma.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: { product: { select: { name: true } } },
      }),
      prisma.saleItem.findMany({
        where: {
          variantId: { in: variantIds },
          sale: { status: "completed", createdAt: { gte: fromDate } },
        },
        select: {
          variantId: true,
          quantity: true,
          unitPrice: true,
          discount: true,
        },
      }),
    ]);

    const revenueMap = new Map<number, number>();
    saleItemsForRevenue.forEach((item) => {
      const rev = item.quantity * item.unitPrice - item.discount;
      revenueMap.set(item.variantId, (revenueMap.get(item.variantId) ?? 0) + rev);
    });

    const variantMap = new Map(variants.map((v) => [v.id, v]));

    const topVariantsWithNames = topVariantsQuery.map((tv) => {
      const variant = variantMap.get(tv.variantId);
      // Use actual sum of (unitPrice * quantity - discount) from SaleItems for accurate historical revenue
      return {
        id: tv.variantId,
        name: variant?.product?.name || `Variante #${tv.variantId}`,
        size: variant?.size,
        color: variant?.color,
        quantitySold: tv._sum.quantity ?? 0,
        revenueGenerated: revenueMap.get(tv.variantId) ?? 0,
      };
    });

    // ── Debt widget for dashboard ─────────────────────────────────────
    const allCustomerSales = await prisma.sale.findMany({
      where: { customerId: { not: null }, status: { not: "refunded" } },
      select: { customerId: true, total: true, amountPaid: true },
    });
    let dashTotalDebt = 0;
    const debtByCustomer = new Map<number, number>();
    for (const s of allCustomerSales) {
      const remaining = Math.max(0, s.total - s.amountPaid);
      if (remaining > 0 && s.customerId) {
        dashTotalDebt += remaining;
        debtByCustomer.set(s.customerId, (debtByCustomer.get(s.customerId) ?? 0) + remaining);
      }
    }
    const dashDebtorCount = debtByCustomer.size;

    const dashRecoveredResult = await prisma.debtPayment.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    });
    const dashRecovered = dashRecoveredResult._sum.amount ?? 0;
    const dashMonthSales = await prisma.sale.findMany({
      where: { status: { not: "refunded" }, createdAt: { gte: startOfMonth } },
      select: { total: true, amountPaid: true },
    });
    const dashMonthGenerated = dashMonthSales.reduce(
      (sum, s) => sum + Math.max(0, s.total - s.amountPaid),
      0
    );
    const dashRecoveryRate =
      dashMonthGenerated > 0
        ? Math.min(100, Math.round((dashRecovered / dashMonthGenerated) * 100))
        : 0;

    return {
      kpis: {
        todayRevenue: todaySales._sum.total ?? 0,
        todaySalesCount: todaySales._count.id,
        monthRevenue: monthSales._sum.total ?? 0,
        monthSalesCount: monthSales._count.id,
        totalProducts,
        totalCustomers,
      },
      lowStockVariants,
      recentSales,
      revenueChart,
      paymentMethods,
      topProducts: topVariantsWithNames,
      debtWidget: {
        totalDebt: dashTotalDebt,
        debtorCount: dashDebtorCount,
        recoveryRate: dashRecoveryRate,
      },
    };
  });
}