import { IpcMain } from "electron";
import { prisma } from "../db/client";

// ─── Types ────────────────────────────────────────────────

interface AddPaymentPayload {
  customerId: number;
  amount: number;
  method: string;
  note?: string;
}

interface GetAllDebtsParams {
  search?: string;
  filter?: "all" | "with_debt" | "no_debt" | "gt_10k" | "gt_50k";
  sort?: "debt_asc" | "debt_desc" | "name_asc" | "name_desc";
  page?: number;
  pageSize?: number;
}

// ─── Helper: compute aggregates from sales ────────────────

function aggregateSales(
  sales: Array<{ total: number; amountPaid: number; createdAt: Date }>
) {
  const totalPurchases = sales.reduce((s, x) => s + x.total, 0);
  const totalPaid = sales.reduce((s, x) => s + x.amountPaid, 0);
  const currentDebt = Math.max(0, totalPurchases - totalPaid);
  const lastPurchaseDate =
    sales.length > 0 ? sales[0].createdAt.toISOString() : undefined;
  return { totalPurchases, totalPaid, currentDebt, lastPurchaseDate };
}

export function registerDebtHandlers(ipcMain: IpcMain) {
  // ─── debts:getStatistics ────────────────────────────────
  // Global KPI cards for the debt dashboard
  ipcMain.handle("debts:getStatistics", async () => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // All customers with their sales for debt computation
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        sales: {
          select: { total: true, amountPaid: true },
          where: { status: { not: "refunded" } },
        },
      },
    });

    let totalDebt = 0;
    let debtorCount = 0;
    const debtors: number[] = [];

    for (const c of customers) {
      const totalPurchases = c.sales.reduce((s, x) => s + x.total, 0);
      const totalPaid = c.sales.reduce((s, x) => s + x.amountPaid, 0);
      const debt = Math.max(0, totalPurchases - totalPaid);
      if (debt > 0) {
        totalDebt += debt;
        debtorCount++;
        debtors.push(debt);
      }
    }

    // Recovered this month = sum of DebtPayment.amount in current month
    const recoveredThisMonthResult = await prisma.debtPayment.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    });
    const recoveredThisMonth = recoveredThisMonthResult._sum.amount ?? 0;

    // Month-generated debt = sum of (total - amountPaid) for sales this month with remaining balance
    const monthSalesWithDebt = await prisma.sale.findMany({
      where: {
        status: { not: "refunded" },
        createdAt: { gte: startOfMonth },
      },
      select: { total: true, amountPaid: true },
    });
    const monthGeneratedDebt = monthSalesWithDebt.reduce(
      (sum, s) => sum + Math.max(0, s.total - s.amountPaid),
      0
    );
    const recoveryRate =
      monthGeneratedDebt > 0
        ? Math.min(100, Math.round((recoveredThisMonth / monthGeneratedDebt) * 100))
        : 0;

    const avgDebtPerDebtor = debtorCount > 0 ? totalDebt / debtorCount : 0;

    return {
      totalDebt,
      debtorCount,
      recoveredThisMonth,
      avgDebtPerDebtor,
      recoveryRate,
    };
  });

  // ─── debts:getAll ───────────────────────────────────────
  // Paginated list of customers with their debt summaries
  ipcMain.handle(
    "debts:getAll",
    async (_e, params?: GetAllDebtsParams) => {
      const page = params?.page ?? 1;
      const pageSize = params?.pageSize ?? 50;
      const skip = (page - 1) * pageSize;
      const search = params?.search?.trim();
      const filter = params?.filter ?? "all";
      const sort = params?.sort ?? "debt_desc";

      const searchWhere = search
        ? {
            OR: [
              { name: { contains: search } },
              { phone: { contains: search } },
            ],
          }
        : {};

      // Fetch all matching customers with their sales (we filter/sort in JS
      // because debt is a computed field, not a DB column)
      const rawCustomers = await prisma.customer.findMany({
        where: searchWhere,
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          notes: true,
          createdAt: true,
          sales: {
            select: { total: true, amountPaid: true, createdAt: true },
            where: { status: { not: "refunded" } },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      // Compute debt for each customer
      let rows = rawCustomers.map((c) => {
        const agg = aggregateSales(c.sales);
        return {
          id: c.id,
          name: c.name,
          phone: c.phone ?? null,
          email: c.email ?? null,
          createdAt: c.createdAt.toISOString(),
          ...agg,
          salesCount: c.sales.length,
        };
      });

      // Apply filter
      switch (filter) {
        case "with_debt":
          rows = rows.filter((r) => r.currentDebt > 0);
          break;
        case "no_debt":
          rows = rows.filter((r) => r.currentDebt === 0);
          break;
        case "gt_10k":
          rows = rows.filter((r) => r.currentDebt > 10000);
          break;
        case "gt_50k":
          rows = rows.filter((r) => r.currentDebt > 50000);
          break;
      }

      // Apply sort
      switch (sort) {
        case "debt_asc":
          rows.sort((a, b) => a.currentDebt - b.currentDebt);
          break;
        case "debt_desc":
          rows.sort((a, b) => b.currentDebt - a.currentDebt);
          break;
        case "name_asc":
          rows.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "name_desc":
          rows.sort((a, b) => b.name.localeCompare(a.name));
          break;
      }

      const total = rows.length;
      const paginated = rows.slice(skip, skip + pageSize);

      return { customers: paginated, total, page, pageSize };
    }
  );

  // ─── debts:getByCustomer ────────────────────────────────
  // Full detail for the customer debt modal
  ipcMain.handle("debts:getByCustomer", async (_e, customerId: number) => {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        notes: true,
        createdAt: true,
        sales: {
          where: { status: { not: "refunded" } },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            receiptNumber: true,
            total: true,
            amountPaid: true,
            paymentMethod: true,
            status: true,
            createdAt: true,
            items: { select: { quantity: true } },
          },
        },
        debtPayments: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            amount: true,
            method: true,
            note: true,
            saleId: true,
            createdAt: true,
          },
        },
      },
    });

    if (!customer) return null;

    const salesWithDebt = customer.sales.map((s) => ({
      ...s,
      remaining: Math.max(0, s.total - s.amountPaid),
      createdAt: s.createdAt.toISOString(),
    }));

    const totalPurchases = customer.sales.reduce((s, x) => s + x.total, 0);
    const totalPaid = customer.sales.reduce((s, x) => s + x.amountPaid, 0);
    const currentDebt = Math.max(0, totalPurchases - totalPaid);

    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      notes: customer.notes,
      createdAt: customer.createdAt.toISOString(),
      summary: { totalPurchases, totalPaid, currentDebt },
      sales: salesWithDebt,
      payments: customer.debtPayments.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
      })),
    };
  });

  // ─── debts:addPayment ───────────────────────────────────
  // Creates a DebtPayment and applies FIFO allocation to Sale.amountPaid
  ipcMain.handle(
    "debts:addPayment",
    async (_e, payload: AddPaymentPayload) => {
      const { customerId, amount, method, note } = payload;

      if (!customerId || amount <= 0) {
        throw new Error("Paramètres invalides");
      }

      return prisma.$transaction(async (tx) => {
        // Find all sales for this customer with remaining debt, oldest first
        const sales = await tx.sale.findMany({
          where: {
            customerId,
            status: { not: "refunded" },
          },
          orderBy: { createdAt: "asc" }, // FIFO
          select: { id: true, total: true, amountPaid: true },
        });

        let remaining = amount;
        let lastAppliedSaleId: number | null = null;

        // Apply payment across sales until exhausted
        for (const sale of sales) {
          if (remaining <= 0) break;
          const saleDebt = Math.max(0, sale.total - sale.amountPaid);
          if (saleDebt <= 0) continue;

          const toApply = Math.min(remaining, saleDebt);
          await tx.sale.update({
            where: { id: sale.id },
            data: { amountPaid: { increment: toApply } },
          });
          remaining -= toApply;
          lastAppliedSaleId = sale.id;
        }

        // Create the DebtPayment record
        const payment = await tx.debtPayment.create({
          data: {
            customerId,
            saleId: lastAppliedSaleId,
            amount,
            method,
            note: note ?? null,
          },
        });

        return payment;
      });
    }
  );
}
