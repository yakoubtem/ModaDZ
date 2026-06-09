import { IpcMain } from "electron";
import { prisma } from "../db/client";
import { logActivity } from "./activityLogs";
import { logAutomaticCashMovement } from "./cashRegister";

// ─── Receipt number generator ─────────────────────────────
function generateReceiptNumber(saleId: number): string {
  const now = new Date();
  const ymd =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  return `REC-${ymd}-${String(saleId).padStart(5, "0")}`;
}

// ─── IPC payload types ────────────────────────────────────
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
  amountPaid?: number;
  notes?: string;
}

interface SalesGetAllParams {
  page?: number;
  pageSize?: number;
  search?: string;       // matches receiptNumber or customer name
  paymentMethod?: string;
  status?: string;
  from?: string;
  to?: string;
  customerId?: number;
}

export function registerSaleHandlers(ipcMain: IpcMain) {
  // ─── Paginated list with filters ──────────────────────────
  ipcMain.handle("sales:getAll", async (_e, params?: SalesGetAllParams) => {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where = {
      ...(params?.status && { status: params.status }),
      ...(params?.paymentMethod && { paymentMethod: params.paymentMethod }),
      ...(params?.customerId && { customerId: params.customerId }),
      ...(params?.search && {
        OR: [
          { receiptNumber: { contains: params.search } },
          { customer: { name: { contains: params.search } } },
        ],
      }),
      ...((params?.from || params?.to) && {
        createdAt: {
          ...(params.from && {
            gte: (() => {
              const d = new Date(params.from);
              d.setHours(0, 0, 0, 0);
              return d;
            })(),
          }),
          ...(params.to && {
            lte: (() => {
              const d = new Date(params.to);
              d.setHours(23, 59, 59, 999);
              return d;
            })(),
          }),
        },
      }),
    };

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          user: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true, phone: true } },
          items: { select: { id: true, quantity: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.sale.count({ where }),
    ]);

    return { sales, total, page, pageSize };
  });

  // ─── Get single sale (full detail for modal / reprint) ───
  ipcMain.handle("sales:getById", async (_e, id: number) => {
    return prisma.sale.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true, phone: true } },
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

  // ─── POS Checkout ─────────────────────────────────────────
  // Transaction order:
  //   1. Business-rule validation (amounts, customer required for debt)
  //   2. Validate all stock (throws on first failure)
  //   3. Decrement stock
  //   4. Create Sale + SaleItems
  //   5. Patch receiptNumber onto the new record
  ipcMain.handle("pos:checkout", async (_e, data: POSCheckoutPayload) => {
    return prisma.$transaction(async (tx) => {
      // ── 1. Business-rule validation ──
      const amountPaid = data.amountPaid ?? data.total;

      // amountPaid must be non-negative
      if (amountPaid < 0) {
        throw new Error("Le montant payé ne peut pas être négatif.");
      }

      // amountPaid must not exceed the sale total
      if (amountPaid > data.total) {
        throw new Error("Le montant payé ne peut pas dépasser le total de la vente.");
      }

      // A customer is REQUIRED when the sale generates a debt
      const remainingDebt = data.total - amountPaid;
      if (remainingDebt > 0 && !data.customerId) {
        throw new Error(
          "Veuillez sélectionner un client pour enregistrer une dette."
        );
      }

      // Verify the provided customer actually exists
      if (data.customerId) {
        const customer = await tx.customer.findUnique({
          where: { id: data.customerId },
          select: { id: true },
        });
        if (!customer) {
          throw new Error(`Client introuvable (ID: ${data.customerId})`);
        }
      }

      // ── 2. Stock validation ──
      for (const item of data.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: { select: { name: true } } },
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

      // ── 3. Decrement stock ──
      for (const item of data.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // ── 4. Create sale (amountPaid already validated above) ──
      const sale = await tx.sale.create({
        data: {
          userId: data.userId,
          customerId: data.customerId ?? null,
          total: data.total,
          discount: data.discount,
          tax: data.tax,
          status: "completed",
          paymentMethod: data.paymentMethod,
          amountPaid,
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
        select: { id: true },
      });

      // ── 5. Patch receiptNumber (needs the new ID) ──
      const receiptNumber = generateReceiptNumber(sale.id);
      const completedSale = await tx.sale.update({
        where: { id: sale.id },
        data: { receiptNumber },
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

      if (data.paymentMethod === "cash") {
        await logAutomaticCashMovement(tx, {
          userId: data.userId,
          type: "sale",
          amount: amountPaid,
          reason: `Vente POS Réf: ${receiptNumber}`,
        });
      }

      await logActivity(
        tx,
        data.userId,
        "CREATE",
        "Sale",
        String(completedSale.id),
        `Enregistrement de la vente ${completedSale.receiptNumber} pour un montant de ${completedSale.total} DZD`
      );

      return completedSale;
    });
  });

  // ─── Refund ──────────────────────────────────────────────
  ipcMain.handle("sales:refund", async (_e, id: number, currentUserId?: number) => {
    return prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!sale) throw new Error("Vente introuvable");
      if (sale.status === "refunded") throw new Error("Vente déjà remboursée");

      for (const item of sale.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }

      const refundedSale = await tx.sale.update({
        where: { id },
        data: { status: "refunded" },
      });

      if (sale.paymentMethod === "cash") {
        await logAutomaticCashMovement(tx, {
          userId: currentUserId || sale.userId,
          type: "refund",
          amount: -sale.amountPaid,
          reason: `Remboursement vente Réf: ${sale.receiptNumber || id}`,
        });
      }

      await logActivity(
        tx,
        currentUserId,
        "REFUND",
        "Sale",
        String(id),
        `Remboursement de la vente Réf: ${refundedSale.receiptNumber || id} pour un montant de ${refundedSale.total} DZD`
      );

      return refundedSale;
    });
  });

  // ─── Recent sales (for Dashboard) ────────────────────────
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
