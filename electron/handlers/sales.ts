import { IpcMain } from "electron";
import { prisma } from "../db/client";

interface SaleItemInput {
  variantId: number;
  quantity: number;
  unitPrice: number;
  discount: number;
}

interface POSCheckoutPayload {
  userId: number;
  customerId?: number;
  items: SaleItemInput[];
  total: number;
  discount: number;
  tax: number;
  paymentMethod: "cash" | "card" | "transfer";
  notes?: string;
}

export function registerSaleHandlers(ipcMain: IpcMain) {
  // ─── Get All Sales (with filters) ────────────────────────
  ipcMain.handle(
    "sales:getAll",
    async (_e, filters?: { from?: string; to?: string; status?: string }) => {
      return prisma.sale.findMany({
        where: {
          ...(filters?.status && { status: filters.status }),
          ...(filters?.from || filters?.to
            ? {
                createdAt: {
                  ...(filters.from && { gte: new Date(filters.from) }),
                  ...(filters.to && { lte: new Date(filters.to) }),
                },
              }
            : {}),
        },
        include: {
          user: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true, phone: true } },
          items: {
            include: {
              variant: {
                include: {
                  product: { select: { id: true, name: true, sku: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }
  );

  // ─── Get Single Sale ──────────────────────────────────────
  ipcMain.handle("sales:getById", async (_e, id: number) => {
    return prisma.sale.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        customer: true,
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
    });
  });

  // ─── POS Checkout (with stock validation) ─────────────────
  // This is the primary sale creation channel for the POS module.
  // Uses a Prisma transaction to:
  //   1. Validate all stock levels (throws if insufficient)
  //   2. Decrement stock atomically
  //   3. Create Sale + SaleItems in one DB write
  ipcMain.handle(
    "pos:checkout",
    async (_e, data: POSCheckoutPayload) => {
      return prisma.$transaction(async (tx) => {
        // ── 1. Validate stock for every item ──
        for (const item of data.items) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            include: {
              product: { select: { name: true } },
            },
          });

          if (!variant) {
            throw new Error(`Variante introuvable (ID: ${item.variantId})`);
          }

          if (variant.stock < item.quantity) {
            throw new Error(
              `Stock insuffisant — ${variant.product.name} ` +
                `(${variant.size}/${variant.color}): ` +
                `${variant.stock} disponible, ${item.quantity} demandé`
            );
          }
        }

        // ── 2. Decrement stock atomically ──
        for (const item of data.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        // ── 3. Create the sale record ──
        return tx.sale.create({
          data: {
            userId: data.userId,
            customerId: data.customerId ?? null,
            total: data.total,
            discount: data.discount,
            tax: data.tax,
            status: "completed",
            paymentMethod: data.paymentMethod,
            notes: data.notes ?? null,
            items: {
              create: data.items.map((item) => ({
                variantId: item.variantId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount: item.discount,
              })),
            },
          },
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
            customer: { select: { id: true, name: true, phone: true } },
            user: { select: { id: true, name: true } },
          },
        });
      });
    }
  );

  // ─── Refund ────────────────────────────────────────────────
  ipcMain.handle("sales:refund", async (_e, id: number) => {
    return prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!sale) throw new Error("Vente introuvable");
      if (sale.status === "refunded")
        throw new Error("Vente déjà remboursée");

      for (const item of sale.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return tx.sale.update({
        where: { id },
        data: { status: "refunded" },
      });
    });
  });

  // ─── Recent Sales (for dashboard) ─────────────────────────
  ipcMain.handle("sales:getRecent", async (_e, limit = 10) => {
    return prisma.sale.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true } },
        items: { select: { quantity: true } },
      },
    });
  });
}
