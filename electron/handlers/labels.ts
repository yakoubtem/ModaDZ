import { IpcMain } from "electron";
import { prisma } from "../db/client";
import { logActivity } from "./activityLogs";

export function registerLabelHandlers(ipcMain: IpcMain) {
  // ─── Get History (Paginated) ───
  ipcMain.handle("labels:getHistory", async (_e, params?: { page?: number; pageSize?: number; search?: string }) => {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params?.search) {
      where.product = {
        OR: [
          { name: { contains: params.search } },
          { sku: { contains: params.search } },
        ],
      };
    }

    const [history, total] = await Promise.all([
      prisma.labelPrintHistory.findMany({
        where,
        include: {
          product: { select: { id: true, name: true, sku: true } },
          user: { select: { id: true, name: true } },
        },
        orderBy: { printedAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.labelPrintHistory.count({ where }),
    ]);

    return { history, total, page, pageSize };
  });

  // ─── Log Label Print Action ───
  ipcMain.handle(
    "labels:logPrint",
    async (_e, data: { productId: number; userId: number; quantity: number; format: string; barcodeType: string; printerName?: string }) => {
      const { productId, userId, quantity, format, barcodeType, printerName } = data;

      if (quantity <= 0) {
        throw new Error("La quantité d'étiquettes doit être supérieure à 0.");
      }

      return prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
          where: { id: productId },
          select: { name: true, sku: true },
        });

        if (!product) {
          throw new Error("Produit introuvable.");
        }

        const log = await tx.labelPrintHistory.create({
          data: {
            productId,
            userId,
            quantity,
            format,
            barcodeType,
            printerName: printerName || null,
          },
        });

        await logActivity(
          tx,
          userId,
          "PRINT_LABEL",
          "Product",
          String(productId),
          `Impression de ${quantity} étiquette(s) pour le produit ${product.name} (Format: ${format}, Type: ${barcodeType})`
        );

        return log;
      });
    }
  );

  // ─── Get Label Stats & Widgets ───
  ipcMain.handle("labels:getStats", async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Labels printed today
    const todayPrinted = await prisma.labelPrintHistory.aggregate({
      where: { printedAt: { gte: today } },
      _sum: { quantity: true },
    });

    // Labels printed this month
    const monthPrinted = await prisma.labelPrintHistory.aggregate({
      where: { printedAt: { gte: startOfMonth } },
      _sum: { quantity: true },
    });

    // Most printed products
    const mostPrinted = await prisma.labelPrintHistory.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    // Fetch product details for the top printed list
    const productIds = mostPrinted.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, sku: true, price: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const topProducts = mostPrinted.map((item) => {
      const p = productMap.get(item.productId);
      return {
        id: item.productId,
        name: p?.name || `Produit #${item.productId}`,
        sku: p?.sku || "",
        price: p?.price || 0,
        quantityPrinted: item._sum.quantity ?? 0,
      };
    });

    return {
      todayCount: todayPrinted._sum.quantity ?? 0,
      monthCount: monthPrinted._sum.quantity ?? 0,
      topProducts,
    };
  });
}
