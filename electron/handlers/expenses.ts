import { IpcMain } from "electron";
import { prisma } from "../db/client";

// ─── Types ────────────────────────────────────────────────

interface ExpenseCreatePayload {
  title: string;
  amount: number;
  category: string;
  expenseDate: string;
  paymentMethod?: string;
  description?: string;
}

interface ExpenseUpdatePayload extends ExpenseCreatePayload {
  id: number;
}

interface ExpenseGetAllParams {
  search?: string;
  category?: string;
  from?: string;
  to?: string;
  minAmount?: number;
  maxAmount?: number;
  sort?: "newest" | "oldest" | "highest" | "lowest";
  page?: number;
  pageSize?: number;
}

export function registerExpenseHandlers(ipcMain: IpcMain) {
  // ─── expenses:getAll ───────────────────────────────────
  // Paginated list with filters
  ipcMain.handle(
    "expenses:getAll",
    async (_e, params?: ExpenseGetAllParams) => {
      const page = params?.page ?? 1;
      const pageSize = params?.pageSize ?? 20;
      const skip = (page - 1) * pageSize;

      const where: Record<string, unknown> = {};

      // Search
      if (params?.search?.trim()) {
        where.OR = [
          { title: { contains: params.search.trim() } },
          { description: { contains: params.search.trim() } },
        ];
      }

      // Category filter
      if (params?.category) {
        where.category = params.category;
      }

      // Date range
      if (params?.from || params?.to) {
        const dateFilter: Record<string, Date> = {};
        if (params?.from) {
          const d = new Date(params.from);
          d.setHours(0, 0, 0, 0);
          dateFilter.gte = d;
        }
        if (params?.to) {
          const d = new Date(params.to);
          d.setHours(23, 59, 59, 999);
          dateFilter.lte = d;
        }
        where.expenseDate = dateFilter;
      }

      // Amount range
      if (params?.minAmount !== undefined || params?.maxAmount !== undefined) {
        const amountFilter: Record<string, number> = {};
        if (params?.minAmount !== undefined && params.minAmount > 0) {
          amountFilter.gte = params.minAmount;
        }
        if (params?.maxAmount !== undefined && params.maxAmount > 0) {
          amountFilter.lte = params.maxAmount;
        }
        if (Object.keys(amountFilter).length > 0) {
          where.amount = amountFilter;
        }
      }

      // Sort mapping
      const orderByMap: Record<string, Record<string, string>> = {
        newest: { expenseDate: "desc" },
        oldest: { expenseDate: "asc" },
        highest: { amount: "desc" },
        lowest: { amount: "asc" },
      };
      const orderBy = orderByMap[params?.sort ?? "newest"] ?? { expenseDate: "desc" };

      const [expenses, total] = await Promise.all([
        prisma.expense.findMany({
          where,
          orderBy,
          skip,
          take: pageSize,
        }),
        prisma.expense.count({ where }),
      ]);

      return { expenses, total, page, pageSize };
    }
  );

  // ─── expenses:getById ──────────────────────────────────
  ipcMain.handle("expenses:getById", async (_e, id: number) => {
    return prisma.expense.findUnique({ where: { id } });
  });

  // ─── expenses:create ──────────────────────────────────
  ipcMain.handle(
    "expenses:create",
    async (_e, data: ExpenseCreatePayload) => {
      if (!data.title?.trim()) throw new Error("Le titre est requis");
      if (!data.amount || data.amount <= 0) throw new Error("Le montant doit être supérieur à 0");
      if (!data.category) throw new Error("La catégorie est requise");
      if (!data.expenseDate) throw new Error("La date est requise");

      return prisma.expense.create({
        data: {
          title: data.title.trim(),
          description: data.description?.trim() || null,
          amount: data.amount,
          category: data.category,
          paymentMethod: data.paymentMethod || null,
          expenseDate: new Date(data.expenseDate),
        },
      });
    }
  );

  // ─── expenses:update ──────────────────────────────────
  ipcMain.handle(
    "expenses:update",
    async (_e, data: ExpenseUpdatePayload) => {
      if (!data.id) throw new Error("ID requis");
      if (!data.title?.trim()) throw new Error("Le titre est requis");
      if (!data.amount || data.amount <= 0) throw new Error("Le montant doit être supérieur à 0");
      if (!data.category) throw new Error("La catégorie est requise");
      if (!data.expenseDate) throw new Error("La date est requise");

      const existing = await prisma.expense.findUnique({ where: { id: data.id } });
      if (!existing) throw new Error("Dépense introuvable");

      return prisma.expense.update({
        where: { id: data.id },
        data: {
          title: data.title.trim(),
          description: data.description?.trim() || null,
          amount: data.amount,
          category: data.category,
          paymentMethod: data.paymentMethod || null,
          expenseDate: new Date(data.expenseDate),
        },
      });
    }
  );

  // ─── expenses:delete ──────────────────────────────────
  ipcMain.handle("expenses:delete", async (_e, id: number) => {
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) throw new Error("Dépense introuvable");
    return prisma.expense.delete({ where: { id } });
  });

  // ─── expenses:getSummary ───────────────────────────────
  // KPI data: month total, today total, top category, total sales (for net profit)
  ipcMain.handle("expenses:getSummary", async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [monthAgg, todayAgg, allExpensesMonth, monthSalesAgg] = await Promise.all([
      // Month total expenses
      prisma.expense.aggregate({
        where: { expenseDate: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      // Today total expenses
      prisma.expense.aggregate({
        where: { expenseDate: { gte: today, lt: tomorrow } },
        _sum: { amount: true },
      }),
      // All expenses this month for category breakdown
      prisma.expense.findMany({
        where: { expenseDate: { gte: startOfMonth } },
        select: { category: true, amount: true },
      }),
      // Month sales total (for net profit calculation)
      prisma.sale.aggregate({
        where: { status: "completed", createdAt: { gte: startOfMonth } },
        _sum: { total: true },
      }),
    ]);

    // Compute top category
    const categoryMap = new Map<string, number>();
    for (const exp of allExpensesMonth) {
      categoryMap.set(exp.category, (categoryMap.get(exp.category) ?? 0) + exp.amount);
    }

    let topCategory: { name: string; amount: number } | null = null;
    let maxAmount = 0;
    for (const [name, amount] of categoryMap) {
      if (amount > maxAmount) {
        maxAmount = amount;
        topCategory = { name, amount };
      }
    }

    return {
      monthTotal: monthAgg._sum.amount ?? 0,
      todayTotal: todayAgg._sum.amount ?? 0,
      topCategory,
      totalSalesMonth: monthSalesAgg._sum.total ?? 0,
    };
  });
}
