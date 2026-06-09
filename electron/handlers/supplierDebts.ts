import { IpcMain } from "electron";
import { prisma } from "../db/client";
import { logActivity } from "./activityLogs";

// ─── Types ────────────────────────────────────────────────

interface AddSupplierPaymentPayload {
  supplierId: number;
  amount: number;
  method: string;
  reference?: string;
  notes?: string;
  createdBy: number;
}

interface GetAllSupplierDebtsParams {
  search?: string;
  filter?: "all" | "with_debt" | "no_debt" | "gt_10k" | "gt_50k";
  sort?: "debt_asc" | "debt_desc" | "name_asc" | "name_desc";
  page?: number;
  pageSize?: number;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

// ─── Helper: compute aggregates from purchases ─────────────

function aggregatePurchases(
  purchases: Array<{ total: number; amountPaid: number; createdAt: Date }>
) {
  const totalPurchases = purchases.reduce((s, x) => s + x.total, 0);
  const totalPaid = purchases.reduce((s, x) => s + x.amountPaid, 0);
  const currentDebt = Math.max(0, totalPurchases - totalPaid);
  const lastPurchaseDate =
    purchases.length > 0 ? purchases[0].createdAt.toISOString() : undefined;
  return { totalPurchases, totalPaid, currentDebt, lastPurchaseDate };
}

export function registerSupplierDebtHandlers(ipcMain: IpcMain) {
  // ─── supplierDebts:getStatistics ──────────────────────────
  ipcMain.handle("supplierDebts:getStatistics", async () => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // All suppliers with their purchases for debt computation
    const suppliers = await prisma.supplier.findMany({
      select: {
        id: true,
        purchases: {
          select: { total: true, amountPaid: true },
        },
      },
    });

    let totalDebt = 0;
    let debtorCount = 0;

    for (const s of suppliers) {
      const totalPurchases = s.purchases.reduce((sum, x) => sum + x.total, 0);
      const totalPaid = s.purchases.reduce((sum, x) => sum + x.amountPaid, 0);
      const debt = Math.max(0, totalPurchases - totalPaid);
      if (debt > 0) {
        totalDebt += debt;
        debtorCount++;
      }
    }

    // Recovered this month = sum of SupplierPayment.amount in current month
    const paidThisMonthResult = await prisma.supplierPayment.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    });
    const paidThisMonth = paidThisMonthResult._sum.amount ?? 0;

    const avgDebtPerDebtor = debtorCount > 0 ? totalDebt / debtorCount : 0;

    return {
      totalDebt,
      debtorCount,
      paidThisMonth,
      avgDebtPerDebtor,
    };
  });

  // ─── supplierDebts:getAll ────────────────────────────────
  ipcMain.handle(
    "supplierDebts:getAll",
    async (_e, params?: GetAllSupplierDebtsParams) => {
      const page = params?.page ?? 1;
      const pageSize = params?.pageSize ?? 50;
      const skip = (page - 1) * pageSize;
      const search = params?.search?.trim();
      const filter = params?.filter ?? "all";
      const sort = params?.sort ?? "debt_desc";
      const fromDate = params?.fromDate;
      const toDate = params?.toDate;
      const minAmount = params?.minAmount;
      const maxAmount = params?.maxAmount;

      const searchWhere = search
        ? {
            OR: [
              { name: { contains: search } },
              { phone: { contains: search } },
            ],
          }
        : {};

      const rawSuppliers = await prisma.supplier.findMany({
        where: searchWhere,
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          notes: true,
          createdAt: true,
          purchases: {
            select: { total: true, amountPaid: true, createdAt: true },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      // Compute debt for each supplier
      let rows = rawSuppliers.map((s) => {
        const agg = aggregatePurchases(s.purchases);
        return {
          id: s.id,
          name: s.name,
          phone: s.phone ?? null,
          email: s.email ?? null,
          createdAt: s.createdAt.toISOString(),
          ...agg,
          purchasesCount: s.purchases.length,
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

      // Apply date range filter (check if any purchase is within range)
      if (fromDate || toDate) {
        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate) : null;
        if (to) to.setHours(23, 59, 59, 999);

        rows = rows.filter((r) => {
          const rawSup = rawSuppliers.find((s) => s.id === r.id);
          if (!rawSup) return false;
          if (rawSup.purchases.length === 0) return false;
          return rawSup.purchases.some((p) => {
            const date = new Date(p.createdAt);
            if (from && date < from) return false;
            if (to && date > to) return false;
            return true;
          });
        });
      }

      // Apply custom amount range filter
      if (minAmount !== undefined && !isNaN(minAmount)) {
        rows = rows.filter((r) => r.currentDebt >= minAmount);
      }
      if (maxAmount !== undefined && !isNaN(maxAmount)) {
        rows = rows.filter((r) => r.currentDebt <= maxAmount);
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

      return { suppliers: paginated, total, page, pageSize };
    }
  );

  // ─── supplierDebts:getById ──────────────────────────────
  ipcMain.handle("supplierDebts:getById", async (_e, supplierId: number) => {
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        notes: true,
        createdAt: true,
        purchases: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            reference: true,
            total: true,
            amountPaid: true,
            createdAt: true,
          },
        },
        supplierPayments: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            amount: true,
            paymentMethod: true,
            reference: true,
            notes: true,
            purchaseId: true,
            createdAt: true,
          },
        },
      },
    });

    if (!supplier) return null;

    const purchasesWithDebt = supplier.purchases.map((p) => {
      let status = "unpaid";
      if (p.amountPaid >= p.total) {
        status = "paid";
      } else if (p.amountPaid > 0) {
        status = "partial";
      }

      return {
        ...p,
        remaining: Math.max(0, p.total - p.amountPaid),
        status,
        createdAt: p.createdAt.toISOString(),
      };
    });

    const totalPurchases = supplier.purchases.reduce((s, x) => s + x.total, 0);
    const totalPaid = supplier.purchases.reduce((s, x) => s + x.amountPaid, 0);
    const currentDebt = Math.max(0, totalPurchases - totalPaid);
    const lastPaymentDate =
      supplier.supplierPayments.length > 0
        ? supplier.supplierPayments[0].createdAt.toISOString()
        : null;

    // Account Statement: Chronological timeline (Purchase, Payment, Purchase, Payment)
    // We sort oldest first (asc) to calculate the running balance
    const statementPurchases = supplier.purchases.map((p) => ({
      id: p.id,
      date: p.createdAt,
      type: "purchase",
      reference: p.reference,
      amount: p.total,
    }));

    const statementPayments = supplier.supplierPayments.map((p) => ({
      id: p.id,
      date: p.createdAt,
      type: "payment",
      reference: p.reference || `PAY-${p.id}`,
      amount: p.amount,
    }));

    const transactions = [...statementPurchases, ...statementPayments];
    transactions.sort((a, b) => a.date.getTime() - b.date.getTime());

    let runningBalance = 0;
    const timeline = transactions.map((t) => {
      if (t.type === "purchase") {
        runningBalance += t.amount;
      } else {
        runningBalance -= t.amount;
      }
      return {
        ...t,
        date: t.date.toISOString(),
        runningBalance,
      };
    });

    // Reverse timeline back to newest first for modal display
    timeline.reverse();

    return {
      id: supplier.id,
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      notes: supplier.notes,
      createdAt: supplier.createdAt.toISOString(),
      summary: { totalPurchases, totalPaid, currentDebt, lastPaymentDate },
      purchases: purchasesWithDebt,
      payments: supplier.supplierPayments.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
      })),
      timeline,
    };
  });

  // ─── supplierPayments:create ────────────────────────────
  ipcMain.handle(
    "supplierPayments:create",
    async (_e, payload: AddSupplierPaymentPayload) => {
      const { supplierId, amount, method, reference, notes, createdBy } = payload;

      if (!supplierId || amount <= 0) {
        throw new Error("Paramètres invalides");
      }

      return prisma.$transaction(async (tx) => {
        // Find all purchases for this supplier with remaining debt, oldest first
        const purchases = await tx.purchase.findMany({
          where: { supplierId },
          orderBy: { createdAt: "asc" }, // FIFO
          select: { id: true, total: true, amountPaid: true, reference: true },
        });

        let remaining = amount;
        const allocations: Array<{ purchaseId: number; reference: string; amount: number }> = [];
        let lastAppliedPurchaseId: number | null = null;

        for (const purchase of purchases) {
          if (remaining <= 0) break;
          const purchaseDebt = Math.max(0, purchase.total - purchase.amountPaid);
          if (purchaseDebt <= 0) continue;

          const toApply = Math.min(remaining, purchaseDebt);
          await tx.purchase.update({
            where: { id: purchase.id },
            data: { amountPaid: { increment: toApply } },
          });

          allocations.push({
            purchaseId: purchase.id,
            reference: purchase.reference,
            amount: toApply,
          });
          remaining -= toApply;
          lastAppliedPurchaseId = purchase.id;
        }

        const payment = await tx.supplierPayment.create({
          data: {
            supplierId,
            purchaseId: lastAppliedPurchaseId,
            amount,
            paymentMethod: method,
            reference: reference ?? null,
            notes: notes ?? null,
            allocations: JSON.stringify(allocations),
            createdBy,
          },
        });

        // Log Activity
        await logActivity(
          tx,
          createdBy,
          "CREATE",
          "SupplierPayment",
          String(payment.id),
          `Création du règlement fournisseur pour ${supplierId}. Réf: ${reference || payment.id}. Montant: ${amount} DZD.`
        );

        // Track debt change log
        if (allocations.length > 0) {
          await logActivity(
            tx,
            createdBy,
            "UPDATE",
            "Purchase",
            String(supplierId),
            `Allocation du paiement de ${amount} DZD sur ${allocations.length} achat(s).`
          );
        }

        return payment;
      });
    }
  );

  // ─── supplierPayments:update ────────────────────────────
  ipcMain.handle(
    "supplierPayments:update",
    async (_e, id: number, payload: { amount: number; method: string; reference?: string; notes?: string; currentUserId: number }) => {
      const { amount, method, reference, notes, currentUserId } = payload;
      if (!id || amount <= 0) throw new Error("Paramètres invalides");

      return prisma.$transaction(async (tx) => {
        const payment = await tx.supplierPayment.findUnique({
          where: { id },
        });

        if (!payment) throw new Error("Paiement introuvable");

        // 1. Reverse old allocations
        if (payment.allocations) {
          const oldAllocations = JSON.parse(payment.allocations) as Array<{
            purchaseId: number;
            amount: number;
          }>;
          for (const alloc of oldAllocations) {
            await tx.purchase.update({
              where: { id: alloc.purchaseId },
              data: { amountPaid: { decrement: alloc.amount } },
            });
          }
        }

        // 2. Re-apply FIFO with new amount
        const purchases = await tx.purchase.findMany({
          where: { supplierId: payment.supplierId },
          orderBy: { createdAt: "asc" },
          select: { id: true, total: true, amountPaid: true, reference: true },
        });

        let remaining = amount;
        const newAllocations: Array<{ purchaseId: number; reference: string; amount: number }> = [];
        let lastAppliedPurchaseId: number | null = null;

        for (const purchase of purchases) {
          if (remaining <= 0) break;
          const purchaseDebt = Math.max(0, purchase.total - purchase.amountPaid);
          if (purchaseDebt <= 0) continue;

          const toApply = Math.min(remaining, purchaseDebt);
          await tx.purchase.update({
            where: { id: purchase.id },
            data: { amountPaid: { increment: toApply } },
          });

          newAllocations.push({
            purchaseId: purchase.id,
            reference: purchase.reference,
            amount: toApply,
          });
          remaining -= toApply;
          lastAppliedPurchaseId = purchase.id;
        }

        // 3. Update payment record
        const updatedPayment = await tx.supplierPayment.update({
          where: { id },
          data: {
            amount,
            paymentMethod: method,
            reference: reference ?? null,
            notes: notes ?? null,
            purchaseId: lastAppliedPurchaseId,
            allocations: JSON.stringify(newAllocations),
          },
        });

        // Log Activity
        await logActivity(
          tx,
          currentUserId,
          "UPDATE",
          "SupplierPayment",
          String(id),
          `Modification du règlement fournisseur Réf: ${updatedPayment.reference || id}. Ancien montant: ${payment.amount} DZD. Nouveau montant: ${amount} DZD.`
        );

        return updatedPayment;
      });
    }
  );

  // ─── supplierPayments:delete ────────────────────────────
  ipcMain.handle(
    "supplierPayments:delete",
    async (_e, id: number, currentUserId: number) => {
      if (!id) throw new Error("ID de paiement invalide");

      return prisma.$transaction(async (tx) => {
        const payment = await tx.supplierPayment.findUnique({
          where: { id },
        });

        if (!payment) throw new Error("Paiement introuvable");

        // Reverse allocations
        if (payment.allocations) {
          const allocations = JSON.parse(payment.allocations) as Array<{
            purchaseId: number;
            amount: number;
          }>;
          for (const alloc of allocations) {
            await tx.purchase.update({
              where: { id: alloc.purchaseId },
              data: { amountPaid: { decrement: alloc.amount } },
            });
          }
        }

        // Delete payment
        await tx.supplierPayment.delete({
          where: { id },
        });

        // Log Activity
        await logActivity(
          tx,
          currentUserId,
          "DELETE",
          "SupplierPayment",
          String(id),
          `Suppression du règlement fournisseur Réf: ${payment.reference || payment.id}. Montant: ${payment.amount} DZD.`
        );

        return true;
      });
    }
  );
}
