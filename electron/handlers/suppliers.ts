import { IpcMain, dialog } from "electron";
import { prisma } from "../db/client";
import { logActivity } from "./activityLogs";
import fs from "fs";

interface SupplierParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: "name" | "debt" | "createdAt";
  sortOrder?: "asc" | "desc";
}

interface SupplierInput {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  currentUserId?: number;
}

export function registerSupplierHandlers(ipcMain: IpcMain) {
  ipcMain.handle("suppliers:getAll", async (_e, params?: SupplierParams) => {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search } },
        { phone: { contains: params.search } },
        { email: { contains: params.search } },
      ];
    }

    // Retrieve suppliers with basic fields and all purchases to calculate aggregates
    // In SQLite, doing this for paginated results is very fast.
    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        include: {
          purchases: {
            select: {
              total: true,
              amountPaid: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.supplier.count({ where }),
    ]);

    // Map stats
    let suppliersWithStats = suppliers.map((supplier) => {
      const purchases = supplier.purchases || [];
      const totalPurchases = purchases.length;
      const totalAmount = purchases.reduce((sum, p) => sum + p.total, 0);
      const remainingDebt = purchases.reduce(
        (sum, p) => sum + Math.max(0, p.total - p.amountPaid),
        0
      );
      const lastPurchase =
        purchases.length > 0
          ? purchases.reduce((latest, p) => (p.createdAt > latest.createdAt ? p : latest), purchases[0])
          : null;

      return {
        id: supplier.id,
        name: supplier.name,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address,
        notes: supplier.notes,
        createdAt: supplier.createdAt.toISOString(),
        updatedAt: supplier.updatedAt.toISOString(),
        totalPurchases,
        totalAmount,
        remainingDebt,
        lastPurchaseDate: lastPurchase ? lastPurchase.createdAt.toISOString() : null,
      };
    });

    // Apply sorting in memory if needed
    if (params?.sortBy) {
      const order = params.sortOrder === "asc" ? 1 : -1;
      if (params.sortBy === "name") {
        suppliersWithStats.sort((a, b) => a.name.localeCompare(b.name) * order);
      } else if (params.sortBy === "debt") {
        suppliersWithStats.sort((a, b) => (a.remainingDebt - b.remainingDebt) * order);
      } else if (params.sortBy === "createdAt") {
        suppliersWithStats.sort(
          (a, b) => (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * order
        );
      }
    }

    // Paginate in memory
    const paginated = suppliersWithStats.slice(skip, skip + pageSize);

    const summary = suppliersWithStats.reduce(
      (acc, curr) => {
        acc.totalAmount += curr.totalAmount;
        acc.remainingDebt += curr.remainingDebt;
        if (curr.totalPurchases > 0) acc.activeCount++;
        return acc;
      },
      { totalAmount: 0, remainingDebt: 0, activeCount: 0 }
    );

    return { suppliers: paginated, total, page, pageSize, summary };
  });

  ipcMain.handle("suppliers:getById", async (_e, id: number) => {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        purchases: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!supplier) return null;

    const purchases = supplier.purchases || [];
    const totalPurchases = purchases.length;
    const totalAmount = purchases.reduce((sum, p) => sum + p.total, 0);
    const remainingDebt = purchases.reduce(
      (sum, p) => sum + Math.max(0, p.total - p.amountPaid),
      0
    );
    const lastPurchase =
      purchases.length > 0
        ? purchases.reduce((latest, p) => (p.createdAt > latest.createdAt ? p : latest), purchases[0])
        : null;

    return {
      ...supplier,
      createdAt: supplier.createdAt.toISOString(),
      updatedAt: supplier.updatedAt.toISOString(),
      stats: {
        totalPurchases,
        totalAmount,
        remainingDebt,
        lastPurchaseDate: lastPurchase ? lastPurchase.createdAt.toISOString() : null,
      },
    };
  });

  ipcMain.handle("suppliers:create", async (_e, data: SupplierInput) => {
    const { currentUserId, ...supplierData } = data;
    const supplier = await prisma.supplier.create({
      data: supplierData,
    });

    await logActivity(
      prisma,
      currentUserId,
      "CREATE",
      "Supplier",
      String(supplier.id),
      `Création du fournisseur ${supplier.name}`
    );

    return supplier;
  });

  ipcMain.handle("suppliers:update", async (_e, id: number, data: SupplierInput) => {
    const { currentUserId, ...supplierData } = data;
    const supplier = await prisma.supplier.update({
      where: { id },
      data: supplierData,
    });

    await logActivity(
      prisma,
      currentUserId,
      "UPDATE",
      "Supplier",
      String(supplier.id),
      `Modification du fournisseur ${supplier.name}`
    );

    return supplier;
  });

  ipcMain.handle("suppliers:delete", async (_e, id: number, currentUserId?: number) => {
    // Check if supplier has purchases
    const count = await prisma.purchase.count({
      where: { supplierId: id },
    });

    if (count > 0) {
      throw new Error(
        "Ce fournisseur ne peut pas être supprimé car il possède des achats enregistrés."
      );
    }

    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new Error("Fournisseur introuvable");

    await prisma.supplier.delete({
      where: { id },
    });

    await logActivity(
      prisma,
      currentUserId,
      "DELETE",
      "Supplier",
      String(id),
      `Suppression du fournisseur ${supplier.name}`
    );

    return true;
  });

  // Export CSV
  ipcMain.handle("suppliers:exportCSV", async (_e, csvContent: string, defaultFilename: string) => {
    try {
      const result = await dialog.showSaveDialog({
        title: "Exporter les fournisseurs",
        defaultPath: defaultFilename,
        filters: [{ name: "CSV Files", extensions: ["csv"] }],
      });

      if (result.canceled || !result.filePath) return false;

      const bom = "\uFEFF";
      fs.writeFileSync(result.filePath, bom + csvContent, "utf-8");
      return true;
    } catch (err) {
      console.error("Failed to export suppliers:", err);
      return false;
    }
  });
}
