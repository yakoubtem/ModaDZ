import { IpcMain, dialog, app } from "electron";
import path from "path";
import fs from "fs";
import { prisma } from "../db/client";
import { logActivity } from "./activityLogs";
import { logAutomaticCashMovement } from "./cashRegister";
import { requirePermission } from "../helpers/rbac";

// ─── Types ────────────────────────────────────────────────

interface ExpenseCreatePayload {
  title: string;
  amount: number;
  category: string;
  expenseDate: string;
  paymentMethod?: string;
  description?: string;
  supplier?: string;
  notes?: string;
  receiptPath?: string;
}

interface ExpenseUpdatePayload extends ExpenseCreatePayload {
  id: number;
}

interface ExpenseGetAllParams {
  search?: string;
  category?: string;
  supplier?: string;
  paymentMethod?: string;
  from?: string;
  to?: string;
  minAmount?: number;
  maxAmount?: number;
  sort?: "newest" | "oldest" | "highest" | "lowest";
  page?: number;
  pageSize?: number;
}

interface ExpenseCategoryPayload {
  name: string;
  isArchived?: boolean;
}

interface ExpenseAnalyticsParams extends ExpenseGetAllParams {}

const DEFAULT_CATEGORIES = [
  "Loyer",
  "Salaires",
  "Transport",
  "Marketing",
  "Fournisseurs",
  "Internet & Téléphone",
  "Électricité & Eau",
  "Maintenance",
  "Emballage",
  "Impôts & Taxes",
  "Divers",
];

function startOfDay(d: Date) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(d: Date) {
  const date = new Date(d);
  date.setHours(23, 59, 59, 999);
  return date;
}

function startOfWeek(d: Date) {
  const date = startOfDay(d);
  const day = date.getDay();
  const diff = (day + 6) % 7;
  date.setDate(date.getDate() - diff);
  return date;
}

function pctChange(current: number, previous: number) {
  if (!previous) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("fr-DZ", { month: "short", year: "2-digit" });
}

function buildMonthSeries(start: Date, end: Date) {
  const months: { key: string; label: string }[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cursor <= end) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    months.push({ key, label: monthLabel(cursor) });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

async function ensureExpenseCategories() {
  const existing = await prisma.expenseCategory.findMany({ select: { name: true } });
  const existingNames = new Set(existing.map((c) => c.name));

  const toCreate = DEFAULT_CATEGORIES.filter((name) => !existingNames.has(name)).map((name) => ({
    name,
    isSystem: true,
  }));

  if (toCreate.length > 0) {
    try {
      await prisma.expenseCategory.createMany({ data: toCreate });
    } catch (e) {
      // Ignore unique constraint violation from race conditions
    }
  }

  const distinctExpenses = await prisma.expense.findMany({
    select: { category: true },
    distinct: ["category"],
  });

  const expenseNames = distinctExpenses
    .map((e) => e.category)
    .filter((name) => name && !existingNames.has(name));

  if (expenseNames.length > 0) {
    try {
      await prisma.expenseCategory.createMany({
        data: expenseNames.map((name) => ({ name, isSystem: false })),
      });
    } catch (e) {
      // Ignore unique constraint violation from race conditions
    }
  }
}

function buildExpenseWhere(params?: ExpenseGetAllParams) {
  const where: Record<string, unknown> = {};

  if (params?.search?.trim()) {
    const q = params.search.trim();
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { supplier: { contains: q } },
      { notes: { contains: q } },
      { category: { contains: q } },
    ];
  }

  if (params?.category) {
    where.category = params.category;
  }

  if (params?.supplier?.trim()) {
    where.supplier = { contains: params.supplier.trim() };
  }

  if (params?.paymentMethod) {
    where.paymentMethod = params.paymentMethod;
  }

  if (params?.from || params?.to) {
    const dateFilter: Record<string, Date> = {};
    if (params?.from) dateFilter.gte = startOfDay(new Date(params.from));
    if (params?.to) dateFilter.lte = endOfDay(new Date(params.to));
    where.expenseDate = dateFilter;
  }

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

  return where;
}

export function registerExpenseHandlers(ipcMain: IpcMain) {
  // ─── Expense Categories ─────────────────────────────────
  ipcMain.handle("expenses:getCategories", async () => {
    await ensureExpenseCategories();
    return prisma.expenseCategory.findMany({ orderBy: { name: "asc" } });
  });

  ipcMain.handle("expenses:createCategory", async (_e, data: ExpenseCategoryPayload) => {
    const name = data.name?.trim();
    if (!name) throw new Error("Le nom de la catégorie est requis");
    return prisma.expenseCategory.create({
      data: {
        name,
        isArchived: false,
        isSystem: false,
      },
    });
  });

  ipcMain.handle(
    "expenses:updateCategory",
    async (_e, params: { id: number; name: string; isArchived?: boolean }) => {
      const existing = await prisma.expenseCategory.findUnique({ where: { id: params.id } });
      if (!existing) throw new Error("Catégorie introuvable");
      const name = params.name?.trim();
      if (!name) throw new Error("Le nom de la catégorie est requis");

      if (name !== existing.name) {
        await prisma.expense.updateMany({
          where: { category: existing.name },
          data: { category: name },
        });
      }

      return prisma.expenseCategory.update({
        where: { id: params.id },
        data: {
          name,
          isArchived: params.isArchived ?? existing.isArchived,
        },
      });
    }
  );

  ipcMain.handle("expenses:archiveCategory", async (_e, params: { id: number; archive: boolean }) => {
    return prisma.expenseCategory.update({
      where: { id: params.id },
      data: { isArchived: params.archive },
    });
  });

  ipcMain.handle("expenses:deleteCategory", async (_e, id: number) => {
    return prisma.expenseCategory.delete({
      where: { id },
    });
  });

  // ─── expenses:getAll ───────────────────────────────────
  // Paginated list with filters
  ipcMain.handle(
    "expenses:getAll",
    async (_e, params?: ExpenseGetAllParams) => {
      const page = params?.page ?? 1;
      const pageSize = params?.pageSize ?? 20;
      const skip = (page - 1) * pageSize;

      const where = buildExpenseWhere(params);

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

  ipcMain.handle(
    "expenses:create",
    async (_e, data: ExpenseCreatePayload & { currentUserId?: number }) => {
      if (!data.title?.trim()) throw new Error("Le titre est requis");
      if (!data.amount || data.amount <= 0) throw new Error("Le montant doit être supérieur à 0");
      if (!data.category) throw new Error("La catégorie est requise");
      if (!data.expenseDate) throw new Error("La date est requise");

      return prisma.$transaction(async (tx) => {
        const expense = await tx.expense.create({
          data: {
            title: data.title.trim(),
            description: data.description?.trim() || null,
            supplier: data.supplier?.trim() || null,
            notes: data.notes?.trim() || null,
            amount: data.amount,
            category: data.category,
            paymentMethod: data.paymentMethod || null,
            receiptPath: data.receiptPath || null,
            expenseDate: new Date(data.expenseDate),
          },
        });

        if (data.paymentMethod === "Espèces") {
          await logAutomaticCashMovement(tx, {
            userId: data.currentUserId || 1,
            type: "expense",
            amount: -data.amount,
            reason: `Dépense: ${expense.title}`,
          });
        }

        await logActivity(
          tx,
          data.currentUserId,
          "CREATE",
          "Expense",
          String(expense.id),
          `Création de la dépense ${expense.title} pour un montant de ${expense.amount} DZD`
        );

        return expense;
      });
    }
  );

  ipcMain.handle(
    "expenses:update",
    async (_e, data: ExpenseUpdatePayload & { currentUserId?: number }) => {
      if (!data.id) throw new Error("ID requis");
      if (!data.title?.trim()) throw new Error("Le titre est requis");
      if (!data.amount || data.amount <= 0) throw new Error("Le montant doit être supérieur à 0");
      if (!data.category) throw new Error("La catégorie est requise");
      if (!data.expenseDate) throw new Error("La date est requise");

      const existing = await prisma.expense.findUnique({ where: { id: data.id } });
      if (!existing) throw new Error("Dépense introuvable");

      return prisma.$transaction(async (tx) => {
        const expense = await tx.expense.update({
          where: { id: data.id },
          data: {
            title: data.title.trim(),
            description: data.description?.trim() || null,
            supplier: data.supplier?.trim() || null,
            notes: data.notes?.trim() || null,
            amount: data.amount,
            category: data.category,
            paymentMethod: data.paymentMethod || null,
            receiptPath: data.receiptPath || null,
            expenseDate: new Date(data.expenseDate),
          },
        });

        if (existing.paymentMethod === "Espèces") {
          await logAutomaticCashMovement(tx, {
            userId: data.currentUserId || 1,
            type: "cash_in",
            amount: existing.amount,
            reason: `Correction Dépense (Annulation): ${existing.title}`,
          });
        }

        if (expense.paymentMethod === "Espèces") {
          await logAutomaticCashMovement(tx, {
            userId: data.currentUserId || 1,
            type: "expense",
            amount: -expense.amount,
            reason: `Dépense (Correction): ${expense.title}`,
          });
        }

        await logActivity(
          tx,
          data.currentUserId,
          "UPDATE",
          "Expense",
          String(expense.id),
          `Modification de la dépense ${expense.title} d'un montant de ${expense.amount} DZD`
        );

        return expense;
      });
    }
  );

  ipcMain.handle("expenses:delete", async (_e, id: number, currentUserId?: number) => {
    await requirePermission(currentUserId, "expenses.delete");
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) throw new Error("Dépense introuvable");

    return prisma.$transaction(async (tx) => {
      if (existing.receiptPath) {
        const fullPath = path.join(app.getPath("userData"), existing.receiptPath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      }
      
      const result = await tx.expense.delete({ where: { id } });

      if (existing.paymentMethod === "Espèces") {
        await logAutomaticCashMovement(tx, {
          userId: currentUserId || 1,
          type: "cash_in",
          amount: existing.amount,
          reason: `Annulation Dépense: ${existing.title}`,
        });
      }

      await logActivity(
        tx,
        currentUserId,
        "DELETE",
        "Expense",
        String(id),
        `Suppression de la dépense ${existing.title} d'un montant de ${existing.amount} DZD`
      );

      return result;
    });
  });

  // ─── Receipt Upload ─────────────────────────────────────
  ipcMain.handle("expenses:selectReceipt", async () => {
    const result = await dialog.showOpenDialog({
      title: "Ajouter un reçu",
      properties: ["openFile"],
      filters: [
        { name: "Fichiers", extensions: ["jpg", "jpeg", "png", "pdf"] },
      ],
    });

    if (result.canceled || !result.filePaths[0]) return null;

    const src = result.filePaths[0];
    const ext = path.extname(src).toLowerCase();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const receiptsDir = path.join(app.getPath("userData"), "receipts");
    const dest = path.join(receiptsDir, filename);

    fs.mkdirSync(receiptsDir, { recursive: true });
    fs.copyFileSync(src, dest);

    return `receipts/${filename}`;
  });

  ipcMain.handle("expenses:deleteReceipt", async (_e, receiptPath: string) => {
    try {
      const fullPath = path.join(app.getPath("userData"), receiptPath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      return true;
    } catch {
      return false;
    }
  });

  ipcMain.handle("expenses:downloadReceipt", async (_e, receiptPath: string) => {
    const fullPath = path.join(app.getPath("userData"), receiptPath);
    if (!fs.existsSync(fullPath)) throw new Error("Reçu introuvable");

    const { canceled, filePath } = await dialog.showSaveDialog({
      title: "Enregistrer le reçu",
      defaultPath: path.basename(receiptPath),
    });
    if (canceled || !filePath) return false;
    fs.copyFileSync(fullPath, filePath);
    return true;
  });

  // ─── expenses:getSummary ───────────────────────────────
  // KPI data: month total, today total, top category, total sales (for net profit)
  ipcMain.handle("expenses:getSummary", async () => {
    const today = new Date();
    const todayStart = startOfDay(today);
    const tomorrow = new Date(todayStart);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startYear = new Date(today.getFullYear(), 0, 1);
    const startWeek = startOfWeek(today);

    const prevDayStart = new Date(todayStart);
    prevDayStart.setDate(prevDayStart.getDate() - 1);
    const prevDayEnd = endOfDay(prevDayStart);

    const prevWeekStart = new Date(startWeek);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEnd = new Date(startWeek);
    prevWeekEnd.setMilliseconds(-1);

    const prevMonthStart = new Date(startMonth.getFullYear(), startMonth.getMonth() - 1, 1);
    const prevMonthEnd = new Date(startMonth.getFullYear(), startMonth.getMonth(), 0, 23, 59, 59, 999);

    const prevYearStart = new Date(startYear.getFullYear() - 1, 0, 1);
    const prevYearEnd = new Date(startYear.getFullYear() - 1, 11, 31, 23, 59, 59, 999);

    const [
      monthAgg,
      todayAgg,
      weekAgg,
      yearAgg,
      prevMonthAgg,
      prevTodayAgg,
      prevWeekAgg,
      prevYearAgg,
      allExpensesMonth,
      monthSalesAgg,
      prevMonthSalesAgg,
      monthSaleItems,
      prevMonthSaleItems,
    ] = await Promise.all([
      prisma.expense.aggregate({ where: { expenseDate: { gte: startMonth } }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { expenseDate: { gte: todayStart, lt: tomorrow } }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { expenseDate: { gte: startWeek } }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { expenseDate: { gte: startYear } }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { expenseDate: { gte: prevMonthStart, lte: prevMonthEnd } }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { expenseDate: { gte: prevDayStart, lte: prevDayEnd } }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { expenseDate: { gte: prevWeekStart, lte: prevWeekEnd } }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { expenseDate: { gte: prevYearStart, lte: prevYearEnd } }, _sum: { amount: true } }),
      prisma.expense.findMany({ where: { expenseDate: { gte: startMonth } }, select: { category: true, amount: true } }),
      prisma.sale.aggregate({ where: { status: "completed", createdAt: { gte: startMonth } }, _sum: { total: true } }),
      prisma.sale.aggregate({ where: { status: "completed", createdAt: { gte: prevMonthStart, lte: prevMonthEnd } }, _sum: { total: true } }),
      prisma.saleItem.findMany({
        where: { sale: { status: "completed", createdAt: { gte: startMonth } } },
        select: {
          quantity: true,
          costPrice: true,
          variant: { select: { product: { select: { costPrice: true } } } },
        },
      }),
      prisma.saleItem.findMany({
        where: { sale: { status: "completed", createdAt: { gte: prevMonthStart, lte: prevMonthEnd } } },
        select: {
          quantity: true,
          costPrice: true,
          variant: { select: { product: { select: { costPrice: true } } } },
        },
      }),
    ]);

    // Compute top category
    const categoryMap = new Map<string, number>();
    for (const exp of allExpensesMonth) {
      categoryMap.set(exp.category, (categoryMap.get(exp.category) ?? 0) + exp.amount);
    }

    let topCategory: { name: string; amount: number; sharePct: number } | null = null;
    let maxAmount = 0;
    for (const [name, amount] of categoryMap) {
      if (amount > maxAmount) {
        maxAmount = amount;
        topCategory = {
          name,
          amount,
          sharePct: monthAgg._sum.amount ? Math.round((amount / monthAgg._sum.amount) * 100) : 0,
        };
      }
    }

    const monthTotal = monthAgg._sum.amount ?? 0;
    const todayTotal = todayAgg._sum.amount ?? 0;
    const weekTotal = weekAgg._sum.amount ?? 0;
    const yearTotal = yearAgg._sum.amount ?? 0;
    const prevMonthTotal = prevMonthAgg._sum.amount ?? 0;
    const prevTodayTotal = prevTodayAgg._sum.amount ?? 0;
    const prevWeekTotal = prevWeekAgg._sum.amount ?? 0;
    const prevYearTotal = prevYearAgg._sum.amount ?? 0;

    const totalSalesMonth = monthSalesAgg._sum.total ?? 0;
    const totalSalesPrevMonth = prevMonthSalesAgg._sum.total ?? 0;

    const monthCOGS = monthSaleItems.reduce((sum, item) => {
      const cost = item.costPrice ?? 0;
      return sum + item.quantity * cost;
    }, 0);
    const netProfitMonth = totalSalesMonth - monthCOGS - monthTotal;

    const prevMonthCOGS = prevMonthSaleItems.reduce((sum, item) => {
      const cost = item.costPrice ?? 0;
      return sum + item.quantity * cost;
    }, 0);
    const netProfitPrevMonth = totalSalesPrevMonth - prevMonthCOGS - prevMonthTotal;

    return {
      monthTotal,
      todayTotal,
      weekTotal,
      yearTotal,
      monthChangePct: pctChange(monthTotal, prevMonthTotal),
      todayChangePct: pctChange(todayTotal, prevTodayTotal),
      weekChangePct: pctChange(weekTotal, prevWeekTotal),
      yearChangePct: pctChange(yearTotal, prevYearTotal),
      topCategory,
      totalSalesMonth,
      netProfitMonth,
      netProfitChangePct: pctChange(netProfitMonth, netProfitPrevMonth),
    };
  });

  // ─── expenses:getAnalytics ─────────────────────────────
  ipcMain.handle("expenses:getAnalytics", async (_e, params?: ExpenseAnalyticsParams) => {
    const now = new Date();
    const defaultStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const rangeStart = params?.from ? startOfDay(new Date(params.from)) : defaultStart;
    const rangeEnd = params?.to ? endOfDay(new Date(params.to)) : endOfDay(now);

    const expenseWhere = buildExpenseWhere({ ...params, from: undefined, to: undefined });

    const expenses = await prisma.expense.findMany({
      where: {
        ...expenseWhere,
        expenseDate: { gte: rangeStart, lte: rangeEnd },
      },
      select: { amount: true, category: true, expenseDate: true },
      orderBy: { expenseDate: "asc" },
    });

    const sales = await prisma.sale.findMany({
      where: { status: "completed", createdAt: { gte: rangeStart, lte: rangeEnd } },
      select: {
        total: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            costPrice: true,
            variant: { select: { product: { select: { costPrice: true } } } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const monthSeries = buildMonthSeries(rangeStart, rangeEnd);
    const expenseByMonth = new Map<string, number>();
    const revenueByMonth = new Map<string, number>();
    const cogsByMonth = new Map<string, number>();
    const categoryMap = new Map<string, number>();

    expenses.forEach((exp) => {
      const d = new Date(exp.expenseDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      expenseByMonth.set(key, (expenseByMonth.get(key) ?? 0) + exp.amount);
      categoryMap.set(exp.category, (categoryMap.get(exp.category) ?? 0) + exp.amount);
    });

    sales.forEach((sale) => {
      const d = new Date(sale.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + sale.total);
      
      const saleCOGS = sale.items.reduce((sum, item) => {
        const cost = item.costPrice ?? 0;
        return sum + item.quantity * cost;
      }, 0);
      cogsByMonth.set(key, (cogsByMonth.get(key) ?? 0) + saleCOGS);
    });

    const monthlyTrend = monthSeries.map((m) => ({
      label: m.label,
      value: Math.round(expenseByMonth.get(m.key) ?? 0),
    }));

    const expensesByCategory = Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);

    const revenueVsExpenses = monthSeries.map((m) => ({
      label: m.label,
      revenue: Math.round(revenueByMonth.get(m.key) ?? 0),
      expenses: Math.round(expenseByMonth.get(m.key) ?? 0),
    }));

    const netProfitEvolution = monthSeries.map((m) => {
      const rev = revenueByMonth.get(m.key) ?? 0;
      const cogs = cogsByMonth.get(m.key) ?? 0;
      const exp = expenseByMonth.get(m.key) ?? 0;
      return {
        label: m.label,
        profit: Math.round(rev - cogs - exp),
      };
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
    const totalCOGS = sales.reduce((sum, s) => {
      return sum + s.items.reduce((itemSum, item) => {
        const cost = item.costPrice ?? 0;
        return itemSum + item.quantity * cost;
      }, 0);
    }, 0);
    const netProfit = totalRevenue - totalCOGS - totalExpenses;
    const marginPct = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
    const profitability = {
      revenue: totalRevenue,
      expenses: totalExpenses,
      netProfit,
      marginPct,
      status: marginPct > 30 ? "excellent" : marginPct >= 10 ? "moderate" : "low",
    } as const;

    const insights: string[] = [];
    if (expensesByCategory[0]) {
      const share = totalExpenses > 0 ? Math.round((expensesByCategory[0].value / totalExpenses) * 100) : 0;
      insights.push(`La catégorie ${expensesByCategory[0].name} représente ${share}% des dépenses.`);
    }

    if (monthSeries.length >= 2) {
      const last = monthlyTrend[monthlyTrend.length - 1]?.value ?? 0;
      const prev = monthlyTrend[monthlyTrend.length - 2]?.value ?? 0;
      const pct = pctChange(last, prev);
      if (pct !== 0) {
        const dir = pct > 0 ? "augmenté" : "diminué";
        insights.push(`Les dépenses ont ${dir} de ${Math.abs(pct)}% sur la dernière période.`);
      }
    }

    if (monthSeries.length >= 2) {
      const last = netProfitEvolution[netProfitEvolution.length - 1]?.profit ?? 0;
      const prev = netProfitEvolution[netProfitEvolution.length - 2]?.profit ?? 0;
      const pct = pctChange(last, prev);
      if (pct !== 0) {
        const dir = pct > 0 ? "en hausse" : "en baisse";
        insights.push(`Le bénéfice net est ${dir} de ${Math.abs(pct)}% sur la dernière période.`);
      }
    }

    const alerts: { type: "high_expense" | "budget_exceeded" | "spike"; title: string; message: string; severity: "info" | "warning" | "danger" }[] = [];

    const settings = await prisma.setting.findUnique({ where: { key: "expensesMonthlyBudget" } });
    const budget = settings?.value ? parseFloat(settings.value) : 0;
    if (budget > 0) {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthTotal = await prisma.expense.aggregate({
        where: { expenseDate: { gte: monthStart } },
        _sum: { amount: true },
      });
      const total = monthTotal._sum.amount ?? 0;
      if (total > budget) {
        alerts.push({
          type: "budget_exceeded",
          title: "Budget mensuel dépassé",
          message: `Les dépenses du mois (${Math.round(total).toLocaleString("fr-DZ")}) dépassent le budget (${Math.round(budget).toLocaleString("fr-DZ")}).`,
          severity: "danger",
        });
      }
    }

    const last30Start = new Date();
    last30Start.setDate(last30Start.getDate() - 30);
    const last7Start = new Date();
    last7Start.setDate(last7Start.getDate() - 7);
    const prev7Start = new Date();
    prev7Start.setDate(prev7Start.getDate() - 14);

    const [last30Expenses, last7Agg, prev7Agg] = await Promise.all([
      prisma.expense.findMany({
        where: { expenseDate: { gte: last30Start } },
        select: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { expenseDate: { gte: last7Start } },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { expenseDate: { gte: prev7Start, lt: last7Start } },
        _sum: { amount: true },
      }),
    ]);

    const avg30 = last30Expenses.length
      ? last30Expenses.reduce((s, e) => s + e.amount, 0) / last30Expenses.length
      : 0;

    if (avg30 > 0) {
      const high = last30Expenses.find((e) => e.amount > avg30 * 2.2);
      if (high) {
        alerts.push({
          type: "high_expense",
          title: "Dépense inhabituelle",
          message: `Une dépense récente dépasse la moyenne (${Math.round(high.amount).toLocaleString("fr-DZ")} DZD).`,
          severity: "warning",
        });
      }
    }

    const last7Total = last7Agg._sum.amount ?? 0;
    const prev7Total = prev7Agg._sum.amount ?? 0;
    const spikePct = pctChange(last7Total, prev7Total);
    if (spikePct >= 25) {
      alerts.push({
        type: "spike",
        title: "Pic de dépenses",
        message: `Les dépenses des 7 derniers jours ont augmenté de ${spikePct}% par rapport à la semaine précédente.`,
        severity: "warning",
      });
    }

    return {
      monthlyTrend,
      expensesByCategory,
      revenueVsExpenses,
      netProfitEvolution,
      profitability,
      insights,
      alerts,
    };
  });

  // ─── expenses:getReport ────────────────────────────────
  ipcMain.handle("expenses:getReport", async (_e, params?: ExpenseGetAllParams) => {
    const where = buildExpenseWhere(params);
    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { expenseDate: "desc" },
    });
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    return { expenses, total };
  });
}
