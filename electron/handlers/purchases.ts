import { IpcMain, dialog } from "electron";
import { prisma } from "../db/client";
import { logActivity } from "./activityLogs";
import fs from "fs";

interface PurchaseItemInput {
  productId: number;
  variantId: number;
  quantity: number;
  costPrice: number;
}

interface PurchaseInput {
  supplierId: number;
  reference: string;
  items: PurchaseItemInput[];
  subtotal: number;
  discount: number;
  total: number;
  amountPaid: number;
  notes?: string;
  currentUserId?: number;
}

interface PurchaseFilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  supplierId?: number;
  status?: "all" | "paid" | "partial" | "unpaid";
  from?: string;
  to?: string;
}

export function registerPurchaseHandlers(ipcMain: IpcMain) {
  // ─── Get All (paginated + filtered) ───────────────────────
  ipcMain.handle("purchases:getAll", async (_e, params?: PurchaseFilterParams) => {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (params?.search) {
      where.reference = { contains: params.search };
    }

    if (params?.supplierId) {
      where.supplierId = params.supplierId;
    }

    if (params?.from || params?.to) {
      where.createdAt = {};
      if (params.from) {
        where.createdAt.gte = new Date(params.from);
      }
      if (params.to) {
        const toDate = new Date(params.to);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    const purchases = await prisma.purchase.findMany({
      where,
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Map and filter status
    let mapped = purchases.map((p) => {
      let status = "unpaid";
      if (p.amountPaid >= p.total) {
        status = "paid";
      } else if (p.amountPaid > 0) {
        status = "partial";
      }

      return {
        ...p,
        status,
        createdAt: p.createdAt.toISOString(),
      };
    });

    if (params?.status && params.status !== "all") {
      mapped = mapped.filter((p) => p.status === params.status);
    }

    const total = mapped.length;
    const paginated = mapped.slice(skip, skip + pageSize);

    return { purchases: paginated, total, page, pageSize };
  });

  // ─── Get By ID ────────────────────────────────────────────
  ipcMain.handle("purchases:getById", async (_e, id: number) => {
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!purchase) return null;

    let status = "unpaid";
    if (purchase.amountPaid >= purchase.total) {
      status = "paid";
    } else if (purchase.amountPaid > 0) {
      status = "partial";
    }

    return {
      ...purchase,
      status,
      createdAt: purchase.createdAt.toISOString(),
    };
  });

  // ─── Create (validate + stock increment + cost price update) ──
  ipcMain.handle("purchases:create", async (_e, data: PurchaseInput) => {
    const {
      supplierId,
      reference,
      items,
      subtotal,
      discount,
      total,
      amountPaid,
      notes,
      currentUserId,
    } = data;

    // Validation rules
    if (amountPaid < 0) {
      throw new Error("Le montant payé ne peut pas être négatif.");
    }
    if (amountPaid > total) {
      throw new Error("Le montant payé ne peut pas dépasser le total.");
    }
    if (!items || items.length === 0) {
      throw new Error("Veuillez ajouter au moins un produit à l'achat.");
    }

    for (const item of items) {
      if (item.quantity <= 0) {
        throw new Error("La quantité doit être supérieure à 0.");
      }
    }

    // Check unique reference
    const existingRef = await prisma.purchase.findUnique({
      where: { reference },
    });
    if (existingRef) {
      throw new Error(`La référence d'achat "${reference}" existe déjà.`);
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Purchase
      const purchase = await tx.purchase.create({
        data: {
          supplierId,
          reference,
          subtotal,
          discount,
          total,
          amountPaid,
          notes,
        },
      });

      // 2. Process items
      for (const item of items) {
        await tx.purchaseItem.create({
          data: {
            purchaseId: purchase.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            costPrice: item.costPrice,
            total: item.quantity * item.costPrice,
          },
        });

        // Increase stock: current stock + purchased quantity
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: { increment: item.quantity },
          },
        });

        // Update product costPrice
        await tx.product.update({
          where: { id: item.productId },
          data: {
            costPrice: item.costPrice,
          },
        });
      }

      // 3. Log Activity
      await logActivity(
        tx,
        currentUserId,
        "CREATE",
        "Purchase",
        String(purchase.id),
        `Enregistrement de l'achat Réf: ${purchase.reference} pour un montant total de ${total} DZD`
      );

      return purchase;
    });

    return result;
  });

  // ─── Delete Purchase ──────────────────────────────────────
  ipcMain.handle("purchases:delete", async (_e, id: number, currentUserId?: number) => {
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!purchase) throw new Error("Achat introuvable");

    const result = await prisma.$transaction(async (tx) => {
      // Deletion logic: decrease stock of variants that were incremented by the purchase
      for (const item of purchase.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
        });
        if (!variant) throw new Error("Variante introuvable");
        if (variant.stock < item.quantity) {
          throw new Error("Impossible de supprimer cet achat car cela créerait un stock négatif.");
        }
      }

      for (const item of purchase.items) {
        // Decrease stock back
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      // Delete the purchase (items cascade delete)
      await tx.purchase.delete({
        where: { id },
      });

      // Log Activity
      await logActivity(
        tx,
        currentUserId,
        "DELETE",
        "Purchase",
        String(id),
        `Suppression de l'achat Réf: ${purchase.reference} (les stocks ont été rétablis)`
      );

      return true;
    });

    return result;
  });

  // ─── Summary stats for KPI cards ──────────────────────────
  ipcMain.handle("purchases:getSummary", async () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [allPurchases, monthPurchasesAgg] = await Promise.all([
      prisma.purchase.findMany({
        select: {
          total: true,
          amountPaid: true,
        },
      }),
      prisma.purchase.aggregate({
        where: { createdAt: { gte: startOfMonth } },
        _sum: { total: true },
      }),
    ]);

    const totalPurchasesAmount = allPurchases.reduce((sum, p) => sum + p.total, 0);
    const totalDebts = allPurchases.reduce(
      (sum, p) => sum + Math.max(0, p.total - p.amountPaid),
      0
    );
    const monthPurchasesAmount = monthPurchasesAgg._sum.total ?? 0;
    const avgPurchaseAmount =
      allPurchases.length > 0 ? totalPurchasesAmount / allPurchases.length : 0;

    return {
      totalPurchasesAmount,
      totalDebts,
      monthPurchasesAmount,
      avgPurchaseAmount,
    };
  });

  // Export CSV
  ipcMain.handle("purchases:exportCSV", async (_e, csvContent: string, defaultFilename: string) => {
    try {
      const result = await dialog.showSaveDialog({
        title: "Exporter les achats",
        defaultPath: defaultFilename,
        filters: [{ name: "CSV Files", extensions: ["csv"] }],
      });

      if (result.canceled || !result.filePath) return false;

      const bom = "\uFEFF";
      fs.writeFileSync(result.filePath, bom + csvContent, "utf-8");
      return true;
    } catch (err) {
      console.error("Failed to export purchases:", err);
      return false;
    }
  });
}
