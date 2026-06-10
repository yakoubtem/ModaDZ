import { IpcMain } from "electron";
import { prisma } from "../db/client";
import { logAutomaticCashMovement } from "./cashRegister";
import { calculateCustomerDebt } from "../helpers/finance";
import { requirePermission } from "../helpers/rbac";
import { logActivity } from "./activityLogs";

// ─── Types ────────────────────────────────────────────────

interface AddPaymentPayload {
  customerId: number;
  amount: number;
  method: string;
  note?: string;
  userId?: number;
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
      const debt = await calculateCustomerDebt(c.id);
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
      let rows = await Promise.all(
        rawCustomers.map(async (c) => {
          const agg = aggregateSales(c.sales);
          const currentDebt = await calculateCustomerDebt(c.id);
          return {
            id: c.id,
            name: c.name,
            phone: c.phone ?? null,
            email: c.email ?? null,
            createdAt: c.createdAt.toISOString(),
            ...agg,
            currentDebt,
            salesCount: c.sales.length,
          };
        })
      );

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
    const currentDebt = await calculateCustomerDebt(customerId);

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

  ipcMain.handle(
    "debts:addPayment",
    async (_e, payload: AddPaymentPayload) => {
      const { customerId, amount, method, note } = payload;
      await requirePermission(payload.userId, "debts.payment");

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
        const allocationsArr: Array<{ saleId: number; amount: number }> = [];

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
          allocationsArr.push({ saleId: sale.id, amount: toApply });
        }

        // Create the DebtPayment record
        const payment = await tx.debtPayment.create({
          data: {
            customerId,
            saleId: lastAppliedSaleId,
            amount,
            method,
            note: note ?? null,
            allocations: JSON.stringify(allocationsArr),
          },
        });

        if (method === "cash") {
          await logAutomaticCashMovement(tx, {
            userId: payload.userId || 1,
            type: "cash_in",
            amount: amount,
            reason: `Règlement dette client #${customerId}`,
          });
        }

        await logActivity(
          tx,
          payload.userId,
          "CREATE",
          "DebtPayment",
          String(payment.id),
          `Nouveau règlement de dette d'un montant de ${amount} DZD pour le client #${customerId}`
        );

        return payment;
      });
    }
  );

  // ─── debts:updatePayment ────────────────────────────────
  ipcMain.handle(
    "debts:updatePayment",
    async (_e, payload: { id: number; amount: number; method: string; note?: string; currentUserId?: number }) => {
      const { id, amount, method, note, currentUserId } = payload;
      await requirePermission(currentUserId, "debts.manage");

      if (amount <= 0) {
        throw new Error("Le montant doit être supérieur à 0");
      }

      return prisma.$transaction(async (tx) => {
        const payment = await tx.debtPayment.findUnique({
          where: { id },
        });
        if (!payment) throw new Error("Paiement introuvable");

        // 1. Rollback old allocations
        if (payment.allocations) {
          const allocs = JSON.parse(payment.allocations) as Array<{ saleId: number; amount: number }>;
          for (const alloc of allocs) {
            await tx.sale.update({
              where: { id: alloc.saleId },
              data: { amountPaid: { decrement: alloc.amount } },
            });
          }
        } else {
          // Fallback rollback: LIFO rollback
          const sales = await tx.sale.findMany({
            where: { customerId: payment.customerId, status: { not: "refunded" } },
            orderBy: { createdAt: "desc" },
          });
          let toRevert = payment.amount;
          for (const sale of sales) {
            if (toRevert <= 0) break;
            const applied = Math.min(toRevert, sale.amountPaid);
            if (applied <= 0) continue;
            await tx.sale.update({
              where: { id: sale.id },
              data: { amountPaid: { decrement: applied } },
            });
            toRevert -= applied;
          }
        }

        // 2. Adjust cash register for rollback of old payment
        if (payment.method === "cash") {
          await logAutomaticCashMovement(tx, {
            userId: currentUserId || 1,
            type: "cash_out",
            amount: -payment.amount,
            reason: `Correction Règlement dette client #${payment.customerId} (Annulation ancien)`,
          });
        }

        // 3. Apply new allocations using FIFO
        const sales = await tx.sale.findMany({
          where: {
            customerId: payment.customerId,
            status: { not: "refunded" },
          },
          orderBy: { createdAt: "asc" }, // FIFO
          select: { id: true, total: true, amountPaid: true },
        });

        let remaining = amount;
        let lastAppliedSaleId: number | null = null;
        const allocationsArr: Array<{ saleId: number; amount: number }> = [];

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
          allocationsArr.push({ saleId: sale.id, amount: toApply });
        }

        // 4. Update the DebtPayment record
        const updated = await tx.debtPayment.update({
          where: { id },
          data: {
            amount,
            method,
            note: note ?? null,
            saleId: lastAppliedSaleId,
            allocations: JSON.stringify(allocationsArr),
          },
        });

        // 5. Adjust cash register for new payment
        if (method === "cash") {
          await logAutomaticCashMovement(tx, {
            userId: currentUserId || 1,
            type: "cash_in",
            amount: amount,
            reason: `Correction Règlement dette client #${payment.customerId} (Nouveau)`,
          });
        }

        // 6. Log Activity
        await logActivity(
          tx,
          currentUserId,
          "UPDATE",
          "DebtPayment",
          String(id),
          `Modification du règlement de dette client #${payment.customerId} (Ancien montant: ${payment.amount} DZD, Nouveau: ${amount} DZD)`
        );

        return updated;
      });
    }
  );

  // ─── debts:deletePayment ────────────────────────────────
  ipcMain.handle(
    "debts:deletePayment",
    async (_e, id: number, currentUserId?: number) => {
      await requirePermission(currentUserId, "debts.manage");

      return prisma.$transaction(async (tx) => {
        const payment = await tx.debtPayment.findUnique({
          where: { id },
        });
        if (!payment) throw new Error("Paiement introuvable");

        // 1. Rollback allocations
        if (payment.allocations) {
          const allocs = JSON.parse(payment.allocations) as Array<{ saleId: number; amount: number }>;
          for (const alloc of allocs) {
            await tx.sale.update({
              where: { id: alloc.saleId },
              data: { amountPaid: { decrement: alloc.amount } },
            });
          }
        } else {
          // Fallback LIFO rollback
          const sales = await tx.sale.findMany({
            where: { customerId: payment.customerId, status: { not: "refunded" } },
            orderBy: { createdAt: "desc" },
          });
          let toRevert = payment.amount;
          for (const sale of sales) {
            if (toRevert <= 0) break;
            const applied = Math.min(toRevert, sale.amountPaid);
            if (applied <= 0) continue;
            await tx.sale.update({
              where: { id: sale.id },
              data: { amountPaid: { decrement: applied } },
            });
            toRevert -= applied;
          }
        }

        // 2. Adjust Cash Register
        if (payment.method === "cash") {
          await logAutomaticCashMovement(tx, {
            userId: currentUserId || 1,
            type: "cash_out",
            amount: -payment.amount,
            reason: `Suppression Règlement dette client #${payment.customerId}`,
          });
        }

        // 3. Delete from DB
        await tx.debtPayment.delete({ where: { id } });

        // 4. Log Activity
        await logActivity(
          tx,
          currentUserId,
          "DELETE",
          "DebtPayment",
          String(id),
          `Suppression du règlement de dette d'un montant de ${payment.amount} DZD pour le client #${payment.customerId}`
        );

        return { success: true };
      });
    }
  );
}
